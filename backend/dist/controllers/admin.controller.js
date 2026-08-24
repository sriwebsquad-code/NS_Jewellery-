"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransaction = exports.getTransactions = exports.getDashboardStats = void 0;
const firebase_1 = require("../config/firebase");
const getDashboardStats = async (req, res) => {
    try {
        const usersSnapshot = await firebase_1.db.collection('users').where('role', '==', 'CUSTOMER').get();
        const totalUsers = usersSnapshot.size;
        const plansSnapshot = await firebase_1.db.collection('userPlans').where('status', '==', 'ACTIVE').get();
        const activePlans = plansSnapshot.size;
        const jewellerySnapshot = await firebase_1.db.collection('jewelleryItems').get();
        const totalJewellery = jewellerySnapshot.size;
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const installmentsSnapshot = await firebase_1.db.collection('installments')
            .where('status', '==', 'PAID')
            .where('paidAt', '>=', startOfMonth.toISOString())
            .get();
        let monthlyRevenue = 0;
        installmentsSnapshot.forEach(doc => {
            monthlyRevenue += (doc.data().amount || 0);
        });
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activePlans,
                totalJewellery,
                monthlyRevenue
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
const getTransactions = async (req, res) => {
    try {
        const status = req.query.status;
        const type = req.query.type;
        let installmentsRef = firebase_1.db.collection('installments');
        if (status)
            installmentsRef = installmentsRef.where('status', '==', status);
        let digitalRef = firebase_1.db.collection('digitalTransactions');
        if (status)
            digitalRef = digitalRef.where('status', '==', status);
        if (type)
            digitalRef = digitalRef.where('type', '==', type);
        const [installmentsSnap, digitalSnap] = await Promise.all([
            installmentsRef.limit(100).get(),
            digitalRef.limit(100).get()
        ]);
        // Manual population of user details since it's NoSQL
        const userCache = {};
        const getUser = async (userId) => {
            if (userCache[userId])
                return userCache[userId];
            const userDoc = await firebase_1.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                userCache[userId] = { name: userDoc.data()?.name, phone: userDoc.data()?.phone };
            }
            else {
                userCache[userId] = { name: 'Unknown', phone: 'Unknown' };
            }
            return userCache[userId];
        };
        const formattedInstallments = [];
        for (const doc of installmentsSnap.docs) {
            const data = doc.data();
            const user = await getUser(data.userId);
            let details = 'Scheme Installment';
            if (data.userPlanId) {
                const userPlanDoc = await firebase_1.db.collection('userPlans').doc(data.userPlanId).get();
                if (userPlanDoc.exists && userPlanDoc.data()?.planId) {
                    const planDoc = await firebase_1.db.collection('plans').doc(userPlanDoc.data()?.planId).get();
                    details = planDoc.exists ? planDoc.data()?.name : details;
                }
            }
            formattedInstallments.push({
                id: doc.id,
                user,
                type: 'SCHEME_INSTALLMENT',
                details,
                amount: data.amount,
                status: data.status,
                date: data.createdAt,
                model: 'installment'
            });
        }
        const formattedDigital = [];
        for (const doc of digitalSnap.docs) {
            const data = doc.data();
            const user = await getUser(data.userId);
            formattedDigital.push({
                id: doc.id,
                user,
                type: `DIGITAL_${data.metalType}_${data.type}`,
                details: `${(data.weight || 0).toFixed(2)}g`,
                amount: data.amount,
                status: data.status,
                date: data.createdAt,
                model: 'digitalTransaction'
            });
        }
        const unified = [...formattedInstallments, ...formattedDigital]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.status(200).json({ success: true, data: unified });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTransactions = getTransactions;
const verifyTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const { model, status } = req.body;
        if (model === 'installment') {
            await firebase_1.db.collection('installments').doc(id).update({
                status,
                paidAt: status === 'PAID' ? new Date().toISOString() : null
            });
        }
        else if (model === 'digitalTransaction') {
            await firebase_1.db.collection('digitalTransactions').doc(id).update({ status });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid model type' });
        }
        res.status(200).json({ success: true, message: 'Transaction verified' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyTransaction = verifyTransaction;
//# sourceMappingURL=admin.controller.js.map