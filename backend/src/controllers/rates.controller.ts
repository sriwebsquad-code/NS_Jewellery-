import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getRates = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('metalRates').orderBy('createdAt', 'desc').limit(1).get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        data: { goldRate: 0, silverRate: 0, lastUpdated: new Date().toISOString() }
      });
    }

    res.status(200).json({ success: true, data: snapshot.docs[0]!.data() });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch rates', error: error.message });
  }
};

export const getRatesHistory = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('metalRates').orderBy('effectiveDate', 'desc').limit(30).get();
    
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch rate history', error: error.message });
  }
};

export const updateRates = async (req: Request, res: Response) => {
  try {
    const { goldRate, silverRate, effectiveDate } = req.body;
    
    if (!goldRate || !silverRate) {
      return res.status(400).json({ success: false, message: 'Rates are required' });
    }

    const docRef = db.collection('metalRates').doc();
    const rate = {
      id: docRef.id,
      goldRate: parseFloat(goldRate),
      silverRate: parseFloat(silverRate),
      effectiveDate: effectiveDate ? new Date(effectiveDate).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await docRef.set(rate);

    // Finalize RATE_PENDING transactions for the newly published business date
    try {
      const rateEffectiveTimestamp = new Date(rate.effectiveDate);
      const rateISTString = rateEffectiveTimestamp.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const rateDateIST = new Date(rateISTString);
      const rateBusinessDate = `${rateDateIST.getFullYear()}-${rateDateIST.getMonth() + 1}-${rateDateIST.getDate()}`;

      let finalizedCount = 0;

      // 1. Finalize Digital Transactions
      const txnsSnapshot = await db.collection('digitalTransactions')
        .where('type', '==', 'BUY')
        .where('status', '==', 'RATE_PENDING')
        .where('businessDate', '==', rateBusinessDate)
        .get();

      for (const txnDoc of txnsSnapshot.docs) {
        const txn = txnDoc.data();
        const metalType = txn.metalType;
        const newRate = metalType === 'GOLD' ? parseFloat(goldRate) : parseFloat(silverRate);
        
        if (newRate > 0) {
          const newWeight = Number((txn.amount / newRate).toFixed(3));
          
          await txnDoc.ref.update({
            weight: newWeight,
            status: 'SUCCESS',
            finalizedAt: new Date().toISOString()
          });
          
          const balanceRef = db.collection('digitalBalances').doc(txn.userId);
          const balanceDoc = await balanceRef.get();
          const currentBalance = balanceDoc.exists ? (balanceDoc.data() || { goldBalance: 0, silverBalance: 0 }) : { goldBalance: 0, silverBalance: 0 };
          
          if (metalType === 'GOLD') {
            currentBalance.goldBalance = parseFloat(((currentBalance.goldBalance || 0) + newWeight).toFixed(3));
          } else if (metalType === 'SILVER') {
            currentBalance.silverBalance = parseFloat(((currentBalance.silverBalance || 0) + newWeight).toFixed(3));
          }
          await balanceRef.set(currentBalance);
          
          const userDoc = await db.collection('users').doc(txn.userId).get();
          if (userDoc.exists) {
             const phone = userDoc.data()?.phone;
             const name = userDoc.data()?.name || 'Customer';
             if (phone) {
                 const { smsService } = require('../services/sms.service');
                 await smsService.sendPaymentFinalized(phone, name, txn.amount.toString(), newRate.toString(), newWeight.toFixed(3));
                 if (metalType === 'GOLD') {
                     await smsService.sendDigitalGold(phone, name, newWeight.toFixed(3), currentBalance.goldBalance.toFixed(3));
                 } else {
                     await smsService.sendDigitalSilver(phone, name, newWeight.toFixed(3), currentBalance.silverBalance.toFixed(3));
                 }
             }
             try {
                await db.collection('notifications').add({
                  userId: txn.userId,
                  title: `Pending Digital ${metalType === 'GOLD' ? 'Gold' : 'Silver'} Finalized`,
                  message: `Your pending purchase has been finalized. ₹${txn.amount} has been converted at today's rate of ₹${newRate} per gram, and ${newWeight.toFixed(3)}g has been added.`,
                  isRead: false,
                  createdAt: new Date().toISOString()
                });
             } catch(e) {}
          }
          finalizedCount++;
        }
      }
      
      // 2. Finalize Scheme Installments
      const installmentsSnapshot = await db.collection('installments')
        .where('status', '==', 'RATE_PENDING')
        .where('businessDate', '==', rateBusinessDate)
        .get();

      for (const instDoc of installmentsSnapshot.docs) {
        const inst = instDoc.data();
        const metalType = inst.metalType;
        const newRate = metalType === 'GOLD' ? parseFloat(goldRate) : parseFloat(silverRate);
        
        if (newRate > 0) {
          const calculatedWeight = inst.amount / newRate;
          
          await instDoc.ref.update({
             status: 'PAID',
             applicableRate: newRate,
             calculatedWeight: calculatedWeight,
             finalizedAt: new Date().toISOString()
          });
          
          const userPlanRef = db.collection('userPlans').doc(inst.userPlanId);
          const userPlanDoc = await userPlanRef.get();
          if (userPlanDoc.exists) {
             const userPlanData = userPlanDoc.data()!;
             const currentAccumulatedWeight = userPlanData.accumulatedWeight || 0;
             await userPlanRef.update({
                 accumulatedWeight: currentAccumulatedWeight + calculatedWeight
             });
          }
          
          const userDoc = await db.collection('users').doc(inst.userId).get();
          if (userDoc.exists) {
             const phone = userDoc.data()?.phone;
             const name = userDoc.data()?.name || 'Customer';
             if (phone) {
                 const { smsService } = require('../services/sms.service');
                 await smsService.sendPaymentFinalized(phone, name, inst.amount.toString(), newRate.toString(), calculatedWeight.toFixed(3));
             }
             try {
                await db.collection('notifications').add({
                  userId: inst.userId,
                  title: `Pending Installment Finalized`,
                  message: `Your pending installment purchase has been finalized. ₹${inst.amount} has been converted at today's rate of ₹${newRate} per gram, and ${calculatedWeight.toFixed(3)}g has been added.`,
                  isRead: false,
                  createdAt: new Date().toISOString()
                });
             } catch(e) {}
          }
          finalizedCount++;
        }
      }

      if (finalizedCount > 0) {
        console.log(`[RATES] Finalized ${finalizedCount} pending transactions to new rates for ${rateBusinessDate}.`);
      }
    } catch (e) {
      console.error('[RATES ERROR] Failed to finalize pending purchases:', e);
    }

    // Global Notification
    try {
      await db.collection('notifications').add({
        userId: 'GLOBAL',
        title: 'Live Rates Updated',
        message: `Today's rates have been updated. Gold: ₹${goldRate}/g, Silver: ₹${silverRate}/g`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch(e) {
      console.error('Failed to add global rate notification:', e);
    }

    res.status(200).json({ success: true, message: 'Rates updated successfully', data: rate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update rates', error: error.message });
  }
};
