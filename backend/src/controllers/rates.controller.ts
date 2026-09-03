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

    // Adjust midnight purchases (purchased between 12:00 AM IST and now)
    try {
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      istTime.setHours(0, 0, 0, 0);
      const midnightUTC = new Date(istTime.getTime() - (5.5 * 60 * 60 * 1000));
      const midnightISO = midnightUTC.toISOString();

      const txnsSnapshot = await db.collection('digitalTransactions')
        .where('type', '==', 'BUY')
        .where('status', '==', 'SUCCESS')
        .where('createdAt', '>=', midnightISO)
        .get();

      const batch = db.batch();
      let adjustedCount = 0;
      
      for (const txnDoc of txnsSnapshot.docs) {
        const txn = txnDoc.data();
        const metalType = txn.metalType;
        const newRate = metalType === 'GOLD' ? parseFloat(goldRate) : parseFloat(silverRate);
        
        if (newRate > 0) {
          const newWeight = txn.amount / newRate;
          const delta = newWeight - txn.weight;
          
          if (Math.abs(delta) > 0.000001) {
            // Update transaction
            batch.update(txnDoc.ref, {
              weight: newWeight,
              originalWeight: txn.weight, // Keep record of original
              adjustedByRateUpdate: true,
              adjustedAt: new Date().toISOString()
            });
            
            // Update balance
            const balanceRef = db.collection('digitalBalances').doc(txn.userId);
            const balanceDoc = await balanceRef.get();
            
            if (balanceDoc.exists) {
              const currentBalance = balanceDoc.data()![metalType === 'GOLD' ? 'goldBalance' : 'silverBalance'] || 0;
              batch.update(balanceRef, {
                [metalType === 'GOLD' ? 'goldBalance' : 'silverBalance']: Math.max(0, currentBalance + delta)
              });
            }
            adjustedCount++;
          }
        }
      }
      
      if (adjustedCount > 0) {
        await batch.commit();
        console.log(`[RATES] Adjusted ${adjustedCount} midnight purchases to new rates.`);
      }
    } catch (e) {
      console.error('[RATES ERROR] Failed to adjust midnight purchases:', e);
    }

    res.status(200).json({ success: true, message: 'Rates updated successfully', data: rate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update rates', error: error.message });
  }
};
