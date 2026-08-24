"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRatesCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const firebase_1 = require("../config/firebase");
// Simulate daily market fluctuation at 11:00 AM everyday
const initRatesCron = () => {
    node_cron_1.default.schedule('0 11 * * *', async () => {
        try {
            console.log('Running daily metal rates update cron job...');
            // Fetch the latest rate to base the fluctuation on
            const snapshot = await firebase_1.db.collection('metalRates')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();
            // Default base rates
            let baseGold = 7250;
            let baseSilver = 85;
            if (!snapshot.empty) {
                const latestRate = snapshot.docs[0].data();
                baseGold = latestRate.goldRate;
                baseSilver = latestRate.silverRate;
            }
            // Simulate a random fluctuation between -1.5% and +1.5%
            const goldFluctuation = 1 + (Math.random() * 0.03 - 0.015);
            const silverFluctuation = 1 + (Math.random() * 0.03 - 0.015);
            const newGold = Math.round(baseGold * goldFluctuation * 100) / 100;
            const newSilver = Math.round(baseSilver * silverFluctuation * 100) / 100;
            const docRef = firebase_1.db.collection('metalRates').doc();
            await docRef.set({
                id: docRef.id,
                goldRate: newGold,
                silverRate: newSilver,
                effectiveDate: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
            console.log(`Successfully updated rates: Gold (₹${newGold}), Silver (₹${newSilver})`);
        }
        catch (error) {
            console.error('Error updating daily metal rates:', error);
        }
    });
};
exports.initRatesCron = initRatesCron;
//# sourceMappingURL=cron.service.js.map