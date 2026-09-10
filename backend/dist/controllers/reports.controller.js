"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = void 0;
const firebase_1 = require("../config/firebase");
const getReports = async (req, res) => {
    try {
        const { type, category, startDate, endDate } = req.query;
        if (!type || !category || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Missing required query parameters' });
        }
        const startIso = new Date(startDate).toISOString();
        // For end date, set to end of the day if it's just a date
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const endIso = end.toISOString();
        let results = [];
        if (type === 'transactions') {
            if (category === 'digigold' || category === 'digisilver') {
                const metalType = category === 'digigold' ? 'GOLD' : 'SILVER';
                const snapshot = await firebase_1.db.collection('digitalTransactions')
                    .where('metalType', '==', metalType)
                    .where('status', '==', 'SUCCESS')
                    .where('createdAt', '>=', startIso)
                    .where('createdAt', '<=', endIso)
                    .get();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    results.push({
                        id: doc.id,
                        date: data.createdAt,
                        type: data.type,
                        user: data.userId || 'Unknown',
                        amount: data.amount,
                        weight: data.weight || 0,
                        metal: metalType,
                        receiptId: data.receiptId || '-'
                    });
                });
            }
            else {
                // Schemes
                let schemeType = '';
                let metalType = '';
                if (category === 'gold_value') {
                    schemeType = 'VALUE_BASED';
                    metalType = 'GOLD';
                }
                else if (category === 'silver_value') {
                    schemeType = 'VALUE_BASED';
                    metalType = 'SILVER';
                }
                else if (category === 'gold_weight') {
                    schemeType = 'WEIGHT_BASED';
                    metalType = 'GOLD';
                }
                else if (category === 'silver_weight') {
                    schemeType = 'WEIGHT_BASED';
                    metalType = 'SILVER';
                }
                // Find plans matching this scheme/metal
                const plansSnap = await firebase_1.db.collection('plans')
                    .where('schemeType', '==', schemeType)
                    .where('metalType', '==', metalType)
                    .get();
                const planIds = plansSnap.docs.map(d => d.id);
                const planNames = plansSnap.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data().name }), {});
                if (planIds.length > 0) {
                    // Find userPlans for these planIds
                    const userPlansMap = {};
                    // Firestore 'in' query supports up to 10 items.
                    // For safety, let's fetch all userPlans and filter in memory if planIds > 10
                    let userPlansSnap;
                    if (planIds.length <= 10) {
                        userPlansSnap = await firebase_1.db.collection('userPlans').where('planId', 'in', planIds).get();
                    }
                    else {
                        userPlansSnap = await firebase_1.db.collection('userPlans').get();
                    }
                    userPlansSnap.forEach(doc => {
                        const data = doc.data();
                        if (planIds.includes(data.planId)) {
                            userPlansMap[doc.id] = { ...data, planName: planNames[data.planId] };
                        }
                    });
                    const userPlanIds = Object.keys(userPlansMap);
                    if (userPlanIds.length > 0) {
                        // Fetch installments
                        // Cannot use 'in' if userPlanIds > 10, so fetch by date range and filter
                        const instSnap = await firebase_1.db.collection('installments')
                            .where('status', '==', 'PAID')
                            .where('createdAt', '>=', startIso)
                            .where('createdAt', '<=', endIso)
                            .get();
                        instSnap.forEach(doc => {
                            const data = doc.data();
                            if (userPlanIds.includes(data.userPlanId)) {
                                results.push({
                                    id: doc.id,
                                    date: data.paidAt || data.createdAt,
                                    type: `Installment - Month ${data.month}`,
                                    user: data.userId || userPlansMap[data.userPlanId].userId || 'Unknown',
                                    amount: data.amount,
                                    weight: data.metalWeight || 0,
                                    planName: userPlansMap[data.userPlanId].planName,
                                    receiptId: data.receiptId || '-'
                                });
                            }
                        });
                    }
                }
            }
        }
        else if (type === 'customers') {
            if (category === 'digigold' || category === 'digisilver') {
                const metalType = category === 'digigold' ? 'GOLD' : 'SILVER';
                // Find users who made their FIRST digital transaction in this date range.
                // Easiest is to fetch all success transactions in range, group by user,
                // and fetch user details. (This is an approximation for new customers)
                const snapshot = await firebase_1.db.collection('digitalTransactions')
                    .where('metalType', '==', metalType)
                    .where('status', '==', 'SUCCESS')
                    .where('createdAt', '>=', startIso)
                    .where('createdAt', '<=', endIso)
                    .get();
                const userSet = new Set();
                const userTotals = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.userId && data.type === 'BUY') {
                        userSet.add(data.userId);
                        if (!userTotals[data.userId])
                            userTotals[data.userId] = { amount: 0, weight: 0 };
                        userTotals[data.userId].amount += data.amount || 0;
                        userTotals[data.userId].weight += data.weight || 0;
                    }
                });
                for (const userId of userSet) {
                    results.push({
                        userId,
                        joinedDate: startIso.slice(0, 10), // approximate for report range
                        metal: metalType,
                        totalAmount: userTotals[userId]?.amount || 0,
                        totalWeight: userTotals[userId]?.weight || 0
                    });
                }
            }
            else {
                // Schemes - Customers who started a plan in this date range
                let schemeType = '';
                let metalType = '';
                if (category === 'gold_value') {
                    schemeType = 'VALUE_BASED';
                    metalType = 'GOLD';
                }
                else if (category === 'silver_value') {
                    schemeType = 'VALUE_BASED';
                    metalType = 'SILVER';
                }
                else if (category === 'gold_weight') {
                    schemeType = 'WEIGHT_BASED';
                    metalType = 'GOLD';
                }
                else if (category === 'silver_weight') {
                    schemeType = 'WEIGHT_BASED';
                    metalType = 'SILVER';
                }
                const plansSnap = await firebase_1.db.collection('plans')
                    .where('schemeType', '==', schemeType)
                    .where('metalType', '==', metalType)
                    .get();
                const planIds = plansSnap.docs.map(d => d.id);
                const planNames = plansSnap.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data().name }), {});
                if (planIds.length > 0) {
                    let userPlansSnap;
                    if (planIds.length <= 10) {
                        userPlansSnap = await firebase_1.db.collection('userPlans')
                            .where('planId', 'in', planIds)
                            .where('createdAt', '>=', startIso)
                            .where('createdAt', '<=', endIso)
                            .get();
                    }
                    else {
                        userPlansSnap = await firebase_1.db.collection('userPlans')
                            .where('createdAt', '>=', startIso)
                            .where('createdAt', '<=', endIso)
                            .get();
                    }
                    userPlansSnap.forEach(doc => {
                        const data = doc.data();
                        if (planIds.includes(data.planId)) {
                            results.push({
                                userId: data.userId,
                                joinedDate: data.createdAt,
                                planName: planNames[data.planId],
                                status: data.status,
                                maturityAmount: data.maturityAmount || 0,
                                paidInstallments: data.paidInstallments || 0
                            });
                        }
                    });
                }
            }
        }
        // Enhance results with User Names/Phones
        const uniqueUserIds = [...new Set(results.map(r => r.user || r.userId).filter(Boolean))];
        const userCache = {};
        // Fetch users in chunks of 10
        for (let i = 0; i < uniqueUserIds.length; i += 10) {
            const chunk = uniqueUserIds.slice(i, i + 10);
            if (chunk.length > 0) {
                const usersSnap = await firebase_1.db.collection('users').where('__name__', 'in', chunk).get();
                usersSnap.forEach(doc => {
                    userCache[doc.id] = doc.data();
                });
            }
        }
        results = results.map(r => {
            const uId = r.user || r.userId;
            const uData = userCache[uId] || {};
            return {
                ...r,
                userName: uData.name || 'Unknown',
                userPhone: uData.phone || 'Unknown',
                customId: uData.customId || '-'
            };
        });
        // Sort by date descending
        results.sort((a, b) => {
            const dateA = new Date(a.date || a.joinedDate || 0).getTime();
            const dateB = new Date(b.date || b.joinedDate || 0).getTime();
            return dateB - dateA;
        });
        res.status(200).json({ success: true, data: results });
    }
    catch (error) {
        console.error('Reports Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getReports = getReports;
//# sourceMappingURL=reports.controller.js.map