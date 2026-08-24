"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemUserMetal = exports.getUserMetalTransactions = exports.getDigitalUsers = exports.getLockerDashboard = exports.createTransaction = exports.getTransactions = exports.getBalance = void 0;
const firebase_1 = require("../config/firebase");
const getBalance = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const doc = await firebase_1.db.collection('digitalBalances').doc(userId).get();
        if (!doc.exists) {
            return res.status(200).json({
                success: true,
                data: { goldBalance: 0, silverBalance: 0 }
            });
        }
        res.status(200).json({ success: true, data: doc.data() });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch balance', error: error.message });
    }
};
exports.getBalance = getBalance;
const getTransactions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const snapshot = await firebase_1.db.collection('digitalTransactions')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, data: txns });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
    }
};
exports.getTransactions = getTransactions;
const createTransaction = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { type, metalType, weight, amount } = req.body;
        if (!type || !metalType || !weight || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const docRef = firebase_1.db.collection('digitalTransactions').doc();
        const txn = {
            id: docRef.id,
            userId,
            type,
            metalType,
            weight: parseFloat(weight),
            amount: parseFloat(amount),
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
        await docRef.set(txn);
        res.status(201).json({ success: true, message: 'Transaction initiated', data: txn });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Transaction failed', error: error.message });
    }
};
exports.createTransaction = createTransaction;
const getLockerDashboard = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const lockerDoc = await firebase_1.db.collection('digitalBalances').doc(userId).get();
        const locker = lockerDoc.exists ? lockerDoc.data() : { goldBalance: 0, silverBalance: 0 };
        const rateSnapshot = await firebase_1.db.collection('metalRates').orderBy('createdAt', 'desc').limit(1).get();
        const currentRates = rateSnapshot.empty ? { goldRate: 0, silverRate: 0, updatedAt: new Date() } : rateSnapshot.docs[0].data();
        res.status(200).json({ success: true, data: { locker, currentRates, installments: [] } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch locker dashboard', error: error.message });
    }
};
exports.getLockerDashboard = getLockerDashboard;
const getDigitalUsers = async (req, res) => {
    try {
        // Fetch all digital balances
        const balancesSnapshot = await firebase_1.db.collection('digitalBalances').get();
        if (balancesSnapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const balancesMap = {};
        const userIds = new Set();
        balancesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            // Only include users who actually have some balance
            if (data.goldBalance > 0 || data.silverBalance > 0) {
                balancesMap[doc.id] = data;
                userIds.add(doc.id);
            }
        });
        if (userIds.size === 0) {
            return res.status(200).json({ success: true, data: [] });
        }
        // Fetch user details
        const usersSnapshot = await firebase_1.db.collection('users').get();
        const result = [];
        usersSnapshot.docs.forEach(doc => {
            if (userIds.has(doc.id)) {
                const userData = doc.data();
                delete userData.mpin;
                result.push({
                    userId: doc.id,
                    user: userData,
                    balances: balancesMap[doc.id]
                });
            }
        });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch digital users', error: error.message });
    }
};
exports.getDigitalUsers = getDigitalUsers;
const getUserMetalTransactions = async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const metalType = String(req.params.metalType);
        const snapshot = await firebase_1.db.collection('digitalTransactions')
            .where('userId', '==', userId)
            .where('metalType', '==', metalType.toUpperCase())
            .get();
        if (snapshot.empty) {
            return res.status(200).json({ success: true, data: [] });
        }
        const txns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in descending order of createdAt in JS to avoid index requirement
        txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.status(200).json({ success: true, data: txns });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
    }
};
exports.getUserMetalTransactions = getUserMetalTransactions;
const redeemUserMetal = async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const metalType = String(req.params.metalType);
        const type = metalType.toUpperCase();
        const balanceRef = firebase_1.db.collection('digitalBalances').doc(userId);
        const balanceDoc = await balanceRef.get();
        if (!balanceDoc.exists) {
            return res.status(404).json({ success: false, message: 'Balance not found' });
        }
        const data = balanceDoc.data();
        const balanceField = type === 'GOLD' ? 'goldBalance' : 'silverBalance';
        const currentBalance = data[balanceField] || 0;
        if (currentBalance <= 0) {
            return res.status(400).json({ success: false, message: 'Insufficient balance to redeem' });
        }
        // Create redemption transaction
        const txnRef = firebase_1.db.collection('digitalTransactions').doc();
        const txn = {
            id: txnRef.id,
            userId,
            type: 'REDEEM',
            metalType: type,
            weight: currentBalance, // record the weight redeemed
            amount: 0, // Admin redeemed, no amount tracked here
            status: 'SUCCESS',
            createdAt: new Date().toISOString()
        };
        await txnRef.set(txn);
        // Zero out balance
        await balanceRef.update({
            [balanceField]: 0
        });
        res.status(200).json({ success: true, message: 'Redeemed successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to redeem', error: error.message });
    }
};
exports.redeemUserMetal = redeemUserMetal;
//# sourceMappingURL=digital.controller.js.map