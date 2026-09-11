import { getNextSequence } from '../utils/counter';
import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const doc = await db.collection('digitalBalances').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(200).json({
        success: true,
        data: { goldBalance: 0, silverBalance: 0 }
      });
    }

    res.status(200).json({ success: true, data: doc.data() });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch balance', error: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const snapshot = await db.collection('digitalTransactions')
      .where('userId', '==', userId)
      .get();
      
    const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in JS to avoid requiring a composite index
    txns.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, data: txns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { type, metalType, weight, amount, status = 'PENDING' } = req.body;

    if (!type || !metalType || !weight || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const docRef = db.collection('digitalTransactions').doc();
    const basePrefix = metalType === 'GOLD' ? 'Digigold' : 'Digisilver';
    let typeStr = 'Buy';
    if (type === 'SELL') typeStr = 'Sell';
    else if (type === 'REDEEM') typeStr = 'Redeem';
    
    const prefix = `${typeStr} ${basePrefix}`;
    const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const receiptId = await getNextSequence(counterId, prefix);
    const txn = {
      id: docRef.id,
      receiptId,
      userId,
      type,
      metalType,
      weight: parseFloat(weight),
      amount: parseFloat(amount),
      status,
      createdAt: new Date().toISOString()
    };

    await docRef.set(txn);

    if (status === 'SUCCESS' && type === 'BUY') {
      const balanceRef = db.collection('digitalBalances').doc(userId);
      const balanceDoc = await balanceRef.get();
      const currentBalance: any = balanceDoc.exists ? (balanceDoc.data() || { goldBalance: 0, silverBalance: 0 }) : { goldBalance: 0, silverBalance: 0 };
      
      if (metalType === 'GOLD') {
        currentBalance.goldBalance = (currentBalance.goldBalance || 0) + parseFloat(weight);
      } else if (metalType === 'SILVER') {
        currentBalance.silverBalance = (currentBalance.silverBalance || 0) + parseFloat(weight);
      }
      
      await balanceRef.set(currentBalance);
    }

    res.status(201).json({ success: true, message: 'Transaction initiated', data: txn });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Transaction failed', error: error.message });
  }
};

export const getLockerDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const lockerDoc = await db.collection('digitalBalances').doc(userId).get();
    const locker: any = lockerDoc.exists ? lockerDoc.data() : { goldBalance: 0, silverBalance: 0 };

    const rateSnapshot = await db.collection('metalRates').orderBy('createdAt', 'desc').limit(1).get();
    const currentRates = rateSnapshot.empty ? { goldRate: 0, silverRate: 0, updatedAt: new Date() } : rateSnapshot.docs[0]!.data();

    const txnsSnapshot = await db.collection('digitalTransactions')
      .where('userId', '==', userId)
      .get();
      
    let transactions = txnsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    // Sort in JS to avoid requiring a composite index
    transactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filter out any corrupted/scheme transactions
    transactions = transactions.filter(t => t.type && ['BUY', 'SELL', 'REDEEM'].includes(t.type.toUpperCase()));

    // Calculate investment metrics
    let goldBuyWeight = 0;
    let goldBuyAmount = 0;
    let silverBuyWeight = 0;
    let silverBuyAmount = 0;

    transactions.forEach(t => {
      if (t.type === 'BUY' && (t.status === 'SUCCESS' || t.status === 'PAID')) {
        if (t.metalType === 'GOLD') {
          goldBuyWeight += (t.weight || 0);
          goldBuyAmount += (t.amount || 0);
        } else if (t.metalType === 'SILVER') {
          silverBuyWeight += (t.weight || 0);
          silverBuyAmount += (t.amount || 0);
        }
      }
    });

    const avgGoldBuyRate = goldBuyWeight > 0 ? goldBuyAmount / goldBuyWeight : 0;
    const avgSilverBuyRate = silverBuyWeight > 0 ? silverBuyAmount / silverBuyWeight : 0;

    const goldBalance = locker.goldBalance || 0;
    const silverBalance = locker.silverBalance || 0;

    locker.totalInvestedGold = avgGoldBuyRate * goldBalance;
    locker.totalInvestedSilver = avgSilverBuyRate * silverBalance;

    locker.currentGoldValue = goldBalance * (currentRates.goldRate || 0);
    locker.currentSilverValue = silverBalance * (currentRates.silverRate || 0);

    locker.goldProfitLoss = locker.currentGoldValue - locker.totalInvestedGold;
    locker.silverProfitLoss = locker.currentSilverValue - locker.totalInvestedSilver;

    res.status(200).json({ success: true, data: { locker, currentRates, installments: [], transactions } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch locker dashboard', error: error.message });
  }
};

export const getDigitalUsers = async (req: Request, res: Response) => {
  try {
    // Fetch all digital balances
    const balancesSnapshot = await db.collection('digitalBalances').get();
    
    if (balancesSnapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    const balancesMap: Record<string, any> = {};
    const userIds = new Set<string>();

    balancesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Only include users who actually have some balance
      if (data.goldBalance > 0 || data.silverBalance > 0) {
        balancesMap[doc.id] = data;
        userIds.add(doc.id);
      }
    });

    if (userIds.size === 0) {
       return res.status(200).json({ success: true, data: [] });
    }

    // Fetch user details
    const usersSnapshot = await db.collection('users').get();
    const result: any[] = [];
    
    usersSnapshot.docs.forEach(doc => {
      if (userIds.has(doc.id)) {
        const userData = doc.data();
        delete userData.mpin;
        
        result.push({
          userId: doc.id,
          user: userData,
          balances: balancesMap[doc.id]
        });
      }
    });

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch digital users', error: error.message });
  }
};

export const getUserMetalTransactions = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);
    const metalType = String(req.params.metalType);

    const snapshot = await db.collection('digitalTransactions')
      .where('userId', '==', userId)
      .where('metalType', '==', metalType.toUpperCase())
      .get();
      
    if (snapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in descending order of createdAt in JS to avoid index requirement
    txns.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, data: txns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

import { smsService } from '../services/sms.service';

export const redeemUserMetal = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);
    const metalType = String(req.params.metalType);
    const type = metalType.toUpperCase();

    const balanceRef = db.collection('digitalBalances').doc(userId);
    const balanceDoc = await balanceRef.get();

    if (!balanceDoc.exists) {
      return res.status(404).json({ success: false, message: 'Balance not found' });
    }

    const data = balanceDoc.data()!;
    const balanceField = type === 'GOLD' ? 'goldBalance' : 'silverBalance';
    const currentBalance = data[balanceField] || 0;

    const redeemWeight = req.body.redeemWeight ? parseFloat(req.body.redeemWeight) : currentBalance;

    if (currentBalance <= 0 || redeemWeight <= 0 || redeemWeight > currentBalance) {
      return res.status(400).json({ success: false, message: 'Invalid or insufficient balance to redeem' });
    }

    const remainingBalance = currentBalance - redeemWeight;

    // Generate receipt ID
    const counterId = type === 'GOLD' ? 'digigold' : 'digisilver';
    const prefix = type === 'GOLD' ? 'digigold' : 'digisilver';
    const receiptId = await getNextSequence(counterId, prefix);

    // Create redemption transaction
    const txnRef = db.collection('digitalTransactions').doc();
    const txn = {
      id: txnRef.id,
      userId,
      type: 'REDEEM',
      metalType: type,
      weight: redeemWeight, // record the weight redeemed
      amount: 0, // Admin redeemed, no amount tracked here
      status: 'SUCCESS',
      receiptId, // Custom formatted sequential ID for bills
      createdAt: new Date().toISOString()
    };
    
    await txnRef.set(txn);

    // Update balance
    await balanceRef.update({
      [balanceField]: remainingBalance
    });

    // Send Notifications
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data()!;
        if (userData.phone) {
          await smsService.sendMetalRedeemed(userData.phone, userData.name || 'Customer', type, redeemWeight.toFixed(4), remainingBalance.toFixed(4));
        }

        await db.collection('notifications').add({
          userId,
          title: `Digital ${type === 'GOLD' ? 'Gold' : 'Silver'} Redeemed`,
          message: `You have successfully redeemed ${redeemWeight.toFixed(4)}g of Digital ${type === 'GOLD' ? 'Gold' : 'Silver'}. Your remaining balance is ${remainingBalance.toFixed(4)}g.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch(e) {
      console.error('Failed to send redemption notifications', e);
    }

    res.status(200).json({ success: true, message: 'Redeemed successfully', receiptId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to redeem', error: error.message });
  }
};
