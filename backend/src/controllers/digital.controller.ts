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
      .orderBy('createdAt', 'desc')
      .get();
      
    const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, data: txns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { type, metalType, weight, amount } = req.body;

    if (!type || !metalType || !weight || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const docRef = db.collection('digitalTransactions').doc();
    const txn = {
      id: docRef.id,
      userId,
      type,
      metalType,
      weight: parseFloat(weight),
      amount: parseFloat(amount),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await docRef.set(txn);

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
    const locker = lockerDoc.exists ? lockerDoc.data() : { goldBalance: 0, silverBalance: 0 };

    const rateSnapshot = await db.collection('metalRates').orderBy('createdAt', 'desc').limit(1).get();
    const currentRates = rateSnapshot.empty ? { goldRate: 0, silverRate: 0, updatedAt: new Date() } : rateSnapshot.docs[0]!.data();

    res.status(200).json({ success: true, data: { locker, currentRates, installments: [] } });
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

    if (currentBalance <= 0) {
      return res.status(400).json({ success: false, message: 'Insufficient balance to redeem' });
    }

    // Create redemption transaction
    const txnRef = db.collection('digitalTransactions').doc();
    const txn = {
      id: txnRef.id,
      userId,
      type: 'REDEEM',
      metalType: type,
      weight: currentBalance, // record the weight redeemed
      amount: 0, // Admin redeemed, no amount tracked here
      status: 'SUCCESS',
      createdAt: new Date().toISOString()
    };
    
    await txnRef.set(txn);

    // Zero out balance
    await balanceRef.update({
      [balanceField]: 0
    });

    res.status(200).json({ success: true, message: 'Redeemed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to redeem', error: error.message });
  }
};
