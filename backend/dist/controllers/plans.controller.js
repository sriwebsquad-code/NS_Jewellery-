"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemUserPlan = exports.getMyPlanTransactions = exports.getUserPlanTransactions = exports.getPlanUsers = exports.payInstallment = exports.getUserPlans = exports.joinPlan = exports.createPlan = exports.getPlans = void 0;
const firebase_1 = require("../config/firebase");
const getPlans = async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('plans').where('isActive', '==', true).get();
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: plans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch plans', error: error.message });
    }
};
exports.getPlans = getPlans;
const createPlan = async (req, res) => {
    try {
        const { name, durationMonths, minAmount, schemeType, metalType } = req.body;
        if (!name || !durationMonths || !minAmount || !schemeType || !metalType) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }
        if (!['VALUE_BASED', 'WEIGHT_BASED'].includes(schemeType)) {
            return res.status(400).json({ success: false, message: 'Invalid schemeType' });
        }
        if (!['GOLD', 'SILVER'].includes(metalType)) {
            return res.status(400).json({ success: false, message: 'Invalid metalType' });
        }
        const docRef = firebase_1.db.collection('plans').doc();
        const plan = {
            id: docRef.id,
            name,
            durationMonths: parseInt(durationMonths),
            minAmount: parseFloat(minAmount),
            schemeType,
            metalType,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        await docRef.set(plan);
        res.status(201).json({ success: true, data: plan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create plan', error: error.message });
    }
};
exports.createPlan = createPlan;
const joinPlan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { planId, monthlyAmount } = req.body;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const planDoc = await firebase_1.db.collection('plans').doc(planId).get();
        if (!planDoc.exists)
            return res.status(404).json({ success: false, message: 'Plan not found' });
        const docRef = firebase_1.db.collection('userPlans').doc();
        const userPlan = {
            id: docRef.id,
            userId,
            planId,
            status: 'ACTIVE',
            monthlyAmount: parseFloat(monthlyAmount),
            totalPaid: 0,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + planDoc.data().durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        await docRef.set(userPlan);
        res.status(201).json({ success: true, message: 'Joined scheme successfully', data: userPlan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to join plan', error: error.message });
    }
};
exports.joinPlan = joinPlan;
const getUserPlans = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const snapshot = await firebase_1.db.collection('userPlans').where('userId', '==', userId).get();
        // Manually fetch related plans
        const planCache = {};
        const formattedPlans = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (!planCache[data.planId]) {
                const p = await firebase_1.db.collection('plans').doc(data.planId).get();
                planCache[data.planId] = p.data();
            }
            formattedPlans.push({
                id: doc.id,
                ...data,
                plan: planCache[data.planId]
            });
        }
        res.status(200).json({ success: true, data: formattedPlans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user plans', error: error.message });
    }
};
exports.getUserPlans = getUserPlans;
const payInstallment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { userPlanId, amount } = req.body;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const userPlanDoc = await firebase_1.db.collection('userPlans').doc(userPlanId).get();
        if (!userPlanDoc.exists || userPlanDoc.data().userId !== userId) {
            return res.status(403).json({ success: false, message: 'Invalid plan' });
        }
        const docRef = firebase_1.db.collection('installments').doc();
        const installment = {
            id: docRef.id,
            userId,
            userPlanId,
            amount: parseFloat(amount),
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
        await docRef.set(installment);
        res.status(201).json({ success: true, message: 'Payment submitted and pending verification', data: installment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Payment failed', error: error.message });
    }
};
exports.payInstallment = payInstallment;
const getPlanUsers = async (req, res) => {
    try {
        const { planId } = req.params;
        // 1. Fetch userPlans for this plan
        const userPlansSnapshot = await firebase_1.db.collection('userPlans').where('planId', '==', planId).get();
        if (userPlansSnapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        // 2. Collect unique user IDs
        const userIds = new Set();
        const userPlansData = userPlansSnapshot.docs.map(doc => {
            const data = doc.data();
            userIds.add(data.userId);
            return { id: doc.id, ...data };
        });
        // 3. Fetch user details for these users
        // Firestore 'in' query has a limit of 10, so we will fetch all users and filter, or fetch one by one if there are few.
        // For an admin panel with potentially many users, getting all users and mapping is safer than 10-limit queries.
        const usersSnapshot = await firebase_1.db.collection('users').get();
        const usersMap = {};
        usersSnapshot.docs.forEach(doc => {
            if (userIds.has(doc.id)) {
                const userData = doc.data();
                delete userData.mpin; // Don't expose mpin
                usersMap[doc.id] = { id: doc.id, ...userData };
            }
        });
        // 4. Combine data
        const result = userPlansData.map(up => ({
            ...up,
            user: usersMap[up.userId] || null
        }));
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch plan users', error: error.message });
    }
};
exports.getPlanUsers = getPlanUsers;
const getUserPlanTransactions = async (req, res) => {
    try {
        const { userPlanId } = req.params;
        const snapshot = await firebase_1.db.collection('installments').where('userPlanId', '==', userPlanId).get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in descending order of createdAt
        transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.status(200).json({ success: true, data: transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
    }
};
exports.getUserPlanTransactions = getUserPlanTransactions;
const getMyPlanTransactions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userPlanId = req.params.userPlanId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const userPlanDoc = await firebase_1.db.collection('userPlans').doc(userPlanId).get();
        if (!userPlanDoc.exists || userPlanDoc.data().userId !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const snapshot = await firebase_1.db.collection('installments').where('userPlanId', '==', userPlanId).get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in descending order of createdAt
        transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.status(200).json({ success: true, data: transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
    }
};
exports.getMyPlanTransactions = getMyPlanTransactions;
const redeemUserPlan = async (req, res) => {
    try {
        const userPlanId = req.params.userPlanId;
        const userPlanRef = firebase_1.db.collection('userPlans').doc(userPlanId);
        const userPlanDoc = await userPlanRef.get();
        if (!userPlanDoc.exists) {
            return res.status(404).json({ success: false, message: 'User plan not found' });
        }
        await userPlanRef.update({
            status: 'REDEEMED',
            redeemedAt: new Date().toISOString()
        });
        res.status(200).json({ success: true, message: 'Scheme redeemed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to redeem scheme', error: error.message });
    }
};
exports.redeemUserPlan = redeemUserPlan;
//# sourceMappingURL=plans.controller.js.map