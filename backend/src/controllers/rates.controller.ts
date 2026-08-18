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

    res.status(200).json({ success: true, message: 'Rates updated successfully', data: rate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update rates', error: error.message });
  }
};
