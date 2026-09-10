"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
const counter_1 = require("../utils/counter");
async function backfillTransactions() {
    console.log('Starting backfill for remaining transactions...');
    // Digital Transactions (BUY / SELL)
    const digiSnap = await firebase_1.db.collection('digitalTransactions').get();
    for (const doc of digiSnap.docs) {
        const data = doc.data();
        if (!data.receiptId || data.receiptId.length > 20) {
            const prefix = data.metalType === 'GOLD' ? 'digigold' : 'digisilver';
            const receiptId = await (0, counter_1.getNextSequence)(prefix, prefix);
            await doc.ref.update({ receiptId });
            console.log('Updated digi:', doc.id, '->', receiptId);
        }
    }
    // Scheme Installments
    const instSnap = await firebase_1.db.collection('installments').get();
    for (const doc of instSnap.docs) {
        const data = doc.data();
        if (!data.receiptId || data.receiptId.length > 20) {
            let prefix = 'Scheme Installment';
            try {
                if (data.userPlanId) {
                    const upDoc = await firebase_1.db.collection('userPlans').doc(data.userPlanId).get();
                    if (upDoc.exists) {
                        const planDoc = await firebase_1.db.collection('plans').doc(upDoc.data().planId).get();
                        if (planDoc.exists) {
                            const pData = planDoc.data();
                            if (pData.metalType === 'GOLD' && pData.schemeType === 'VALUE_BASED')
                                prefix = 'Gold Value Schemes';
                            else if (pData.metalType === 'GOLD' && pData.schemeType === 'WEIGHT_BASED')
                                prefix = 'Gold Weight Schemes';
                            else if (pData.metalType === 'SILVER' && pData.schemeType === 'VALUE_BASED')
                                prefix = 'Silver Value Schemes';
                            else if (pData.metalType === 'SILVER' && pData.schemeType === 'WEIGHT_BASED')
                                prefix = 'Silver Weight Schemes';
                            else
                                prefix = pData.name || 'Scheme Installment';
                        }
                    }
                }
            }
            catch (e) { }
            const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const receiptId = await (0, counter_1.getNextSequence)(counterId, prefix);
            await doc.ref.update({ receiptId });
            console.log('Updated installment:', doc.id, '->', receiptId);
        }
    }
    console.log('Done with transactions');
}
backfillTransactions().then(() => process.exit(0)).catch(console.error);
//# sourceMappingURL=backfill.js.map