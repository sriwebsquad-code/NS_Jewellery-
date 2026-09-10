import app, { db } from '../config/firebase';
import { getNextSequence } from '../utils/counter';

async function backfillTransactions() {
  console.log('Starting backfill for transactions...');
  
  // Digital Transactions
  const digiSnap = await db.collection('digitalTransactions').where('type', '==', 'REDEEM').get();
  for (const doc of digiSnap.docs) {
    const data = doc.data();
    if (!data.receiptId || data.receiptId.length > 20) {
      const prefix = data.metalType === 'GOLD' ? 'digigold' : 'digisilver';
      const receiptId = await getNextSequence(prefix, prefix);
      await doc.ref.update({ receiptId });
      console.log('Updated digi:', doc.id, '->', receiptId);
    }
  }

  // Scheme Redemptions
  const plansSnap = await db.collection('userPlans').where('status', '==', 'REDEEMED').get();
  for (const doc of plansSnap.docs) {
    const data = doc.data();
    if (!data.receiptId || data.receiptId.length > 20) {
      let prefix = 'Scheme';
      try {
        const planDoc = await db.collection('plans').doc(data.planId).get();
        if (planDoc.exists) {
          const pData = planDoc.data();
          if (pData.metalType === 'GOLD' && pData.schemeType === 'VALUE_BASED') prefix = 'Gold Value Schemes';
          else if (pData.metalType === 'GOLD' && pData.schemeType === 'WEIGHT_BASED') prefix = 'Gold Weight Schemes';
          else if (pData.metalType === 'SILVER' && pData.schemeType === 'VALUE_BASED') prefix = 'Silver Value Schemes';
          else if (pData.metalType === 'SILVER' && pData.schemeType === 'WEIGHT_BASED') prefix = 'Silver Weight Schemes';
          else prefix = pData.name || 'Scheme';
        }
      } catch (e) {}
      
      const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const receiptId = await getNextSequence(counterId, prefix);
      await doc.ref.update({ receiptId });
      console.log('Updated scheme:', doc.id, '->', receiptId);
    }
  }
  
  console.log('Done with transactions');
}

backfillTransactions().then(() => process.exit(0)).catch(console.error);
