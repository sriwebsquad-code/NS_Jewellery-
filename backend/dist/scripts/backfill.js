"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
const counter_1 = require("../utils/counter");
async function backfillUsers() {
    console.log('Starting backfill for users...');
    const usersSnap = await firebase_1.db.collection('users').get();
    for (const doc of usersSnap.docs) {
        const data = doc.data();
        if (!data.customId) {
            const customId = await (0, counter_1.getNextSequence)('customer_id', 'NSMJCUD');
            await doc.ref.update({ customId });
            console.log('Updated user:', doc.id, '->', customId);
        }
    }
    console.log('Done with users');
}
backfillUsers().then(() => process.exit(0)).catch(console.error);
//# sourceMappingURL=backfill.js.map