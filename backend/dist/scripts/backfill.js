"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
const counter_1 = require("../utils/counter");
async function fixCustomerIds() {
    console.log('Resetting customer_id counter...');
    await firebase_1.db.collection('counters').doc('customer_id').set({ seq: 0 });
    console.log('Fetching users ordered by createdAt asc...');
    const usersSnap = await firebase_1.db.collection('users').orderBy('createdAt', 'asc').get();
    for (const doc of usersSnap.docs) {
        const customId = await (0, counter_1.getNextSequence)('customer_id', 'NSMJCUD');
        await doc.ref.update({ customId });
        console.log('Re-assigned user:', doc.id, '->', customId, 'created at:', doc.data().createdAt);
    }
    console.log('Done fixing customer IDs');
}
fixCustomerIds().then(() => process.exit(0)).catch(console.error);
//# sourceMappingURL=backfill.js.map