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
