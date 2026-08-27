"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRemindersCron = exports.initRatesCron = void 0;
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
const initRemindersCron = () => {
    // Run every day at 9:00 AM
    node_cron_1.default.schedule('0 9 * * *', async () => {
        try {
            console.log('Running daily payment reminders cron job...');
            const snapshot = await firebase_1.db.collection('userPlans').where('status', '==', 'ACTIVE').get();
            if (snapshot.empty)
                return;
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day
            const msInDay = 1000 * 60 * 60 * 24;
            const reminderDays = [7, 3, 2, 1];
            for (const doc of snapshot.docs) {
                const userPlan = doc.data();
                if (!userPlan.nextPaymentDate)
                    continue;
                const nextPaymentDate = new Date(userPlan.nextPaymentDate);
                nextPaymentDate.setHours(0, 0, 0, 0);
                const diffTime = nextPaymentDate.getTime() - today.getTime();
                const diffDays = Math.round(diffTime / msInDay);
                if (reminderDays.includes(diffDays)) {
                    // It's a reminder day! Generate a notification
                    const planSnapshot = await firebase_1.db.collection('plans').doc(userPlan.planId).get();
                    const planName = planSnapshot.exists ? planSnapshot.data().name : 'your plan';
                    const docRef = firebase_1.db.collection('notifications').doc();
                    await docRef.set({
                        id: docRef.id,
                        userId: userPlan.userId,
                        title: 'Payment Reminder',
                        body: `Your next installment of ₹${userPlan.monthlyAmount} for ${planName} is due in ${diffDays} day${diffDays === 1 ? '' : 's'} on ${nextPaymentDate.toLocaleDateString()}.`,
                        type: 'PAYMENT_REMINDER',
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });
                    console.log(`Generated payment reminder for user ${userPlan.userId} (Plan: ${planName}) - ${diffDays} days left.`);
                }
            }
        }
        catch (error) {
            console.error('Error running daily payment reminders:', error);
        }
    });
};
exports.initRemindersCron = initRemindersCron;
//# sourceMappingURL=cron.service.js.map