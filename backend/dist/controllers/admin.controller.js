"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransaction = exports.getTransactions = exports.getDashboardStats = void 0;
const firebase_1 = require("../config/firebase");
const sms_service_1 = require("../services/sms.service");
const getDashboardStats = async (req, res) => {
    try {
        const usersSnapshot = await firebase_1.db.collection('users').get();
        let totalUsers = 0;
        usersSnapshot.forEach(doc => {
            if (doc.data().role !== 'ADMIN') {
                totalUsers++;
            }
        });
        const plansSnapshot = await firebase_1.db.collection('userPlans').where('status', '==', 'ACTIVE').get();
        const activePlans = plansSnapshot.size;
        let plansBreakdown = {
            goldValue: 0,
            silverValue: 0,
            goldWeight: 0,
            silverWeight: 0
        };
        const allPlansSnapshot = await firebase_1.db.collection('plans').get();
        const plansMap = {};
        allPlansSnapshot.forEach(doc => {
            plansMap[doc.id] = doc.data();
        });
        plansSnapshot.forEach(doc => {
            const p = doc.data();
            const planInfo = plansMap[p.planId];
            if (planInfo) {
                if (planInfo.metalType === 'GOLD') {
                    if (planInfo.schemeType === 'VALUE_BASED')
                        plansBreakdown.goldValue++;
                    else
                        plansBreakdown.goldWeight++;
                }
                else if (planInfo.metalType === 'SILVER') {
                    if (planInfo.schemeType === 'VALUE_BASED')
                        plansBreakdown.silverValue++;
                    else
                        plansBreakdown.silverWeight++;
                }
            }
        });
        const digitalBalancesSnapshot = await firebase_1.db.collection('digitalBalances').get();
        let totalGoldMembers = 0;
        let totalSilverMembers = 0;
        let totalGoldWeight = 0;
        let totalSilverWeight = 0;
        digitalBalancesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.goldBalance > 0) {
                totalGoldMembers++;
                totalGoldWeight += data.goldBalance;
            }
            if (data.silverBalance > 0) {
                totalSilverMembers++;
                totalSilverWeight += data.silverBalance;
            }
        });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        let monthlyRevenue = 0;
        let revenueBreakdown = {
            digiSilver: 0,
            digiGold: 0,
            goldValue: 0,
            silverValue: 0,
            goldWeight: 0,
            silverWeight: 0
        };
        const allUserPlansSnapshot = await firebase_1.db.collection('userPlans').get();
        const userPlansMap = {};
        allUserPlansSnapshot.forEach(doc => {
            userPlansMap[doc.id] = doc.data();
        });
        const installmentsSnapshot = await firebase_1.db.collection('installments')
            .where('status', '==', 'PAID')
            .get();
        installmentsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.paidAt && data.paidAt >= startOfMonth.toISOString()) {
                const amt = data.amount || 0;
                monthlyRevenue += amt;
                const uPlan = userPlansMap[data.userPlanId];
                if (uPlan) {
                    const planInfo = plansMap[uPlan.planId];
                    if (planInfo) {
                        if (planInfo.metalType === 'GOLD') {
                            if (planInfo.schemeType === 'VALUE_BASED')
                                revenueBreakdown.goldValue += amt;
                            else
                                revenueBreakdown.goldWeight += amt;
                        }
                        else if (planInfo.metalType === 'SILVER') {
                            if (planInfo.schemeType === 'VALUE_BASED')
                                revenueBreakdown.silverValue += amt;
                            else
                                revenueBreakdown.silverWeight += amt;
                        }
                    }
                }
            }
        });
        const digitalTxnsSnapshot = await firebase_1.db.collection('digitalTransactions')
            .where('status', '==', 'SUCCESS')
            .where('type', '==', 'BUY')
            .get();
        digitalTxnsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt && data.createdAt >= startOfMonth.toISOString()) {
                const amt = data.amount || 0;
                monthlyRevenue += amt;
                if (data.metalType === 'GOLD')
                    revenueBreakdown.digiGold += amt;
                else if (data.metalType === 'SILVER')
                    revenueBreakdown.digiSilver += amt;
            }
        });
        // Recent Actions
        let recentActions = [];
        try {
            const recentTxnsSnapshot = await firebase_1.db.collection('digitalTransactions').orderBy('createdAt', 'desc').limit(5).get();
            const actionsPromises = recentTxnsSnapshot.docs.map(async (doc) => {
                const data = doc.data();
                let userName = 'Unknown';
                if (data.userId) {
                    const userDoc = await firebase_1.db.collection('users').doc(data.userId).get();
                    if (userDoc.exists)
                        userName = userDoc.data()?.name || data.userId.substring(0, 4);
                }
                return {
                    id: doc.id,
                    title: `${data.type} ${data.metalType}`,
                    time: data.createdAt,
                    user: userName
                };
            });
            recentActions = await Promise.all(actionsPromises);
        }
        catch (e) {
            console.log('Error fetching recent actions, maybe index missing:', e);
        }
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activePlans,
                plansBreakdown,
                totalGoldMembers,
                totalSilverMembers,
                totalGoldWeight,
                totalSilverWeight,
                monthlyRevenue,
                revenueBreakdown,
                recentActions
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
        const userId = req.query.userId;
        let installmentsRef = firebase_1.db.collection('installments');
        if (status)
            installmentsRef = installmentsRef.where('status', '==', status);
        if (userId)
            installmentsRef = installmentsRef.where('userId', '==', userId);
        let digitalRef = firebase_1.db.collection('digitalTransactions');
        if (status)
            digitalRef = digitalRef.where('status', '==', status);
        if (type)
            digitalRef = digitalRef.where('type', '==', type);
        if (userId)
            digitalRef = digitalRef.where('userId', '==', userId);
        const [installmentsSnap, digitalSnap, redemptionsSnap] = await Promise.all([
            installmentsRef.limit(100).get(),
            digitalRef.limit(100).get(),
            firebase_1.db.collection('userPlans').where('status', '==', 'REDEEMED').limit(100).get()
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
                    if (planDoc.exists) {
                        const pData = planDoc.data();
                        let n = pData.name?.toLowerCase().trim() || '';
                        if (pData.metalType === 'GOLD' && pData.schemeType === 'VALUE_BASED')
                            details = 'Gold Value Schemes';
                        else if (pData.metalType === 'GOLD' && pData.schemeType === 'WEIGHT_BASED')
                            details = 'Gold Weight Schemes';
                        else if (pData.metalType === 'SILVER' && pData.schemeType === 'VALUE_BASED')
                            details = 'Silver Value Schemes';
                        else if (pData.metalType === 'SILVER' && pData.schemeType === 'WEIGHT_BASED')
                            details = 'Silver Weight Schemes';
                        else if (n.includes('gold') && (n.includes('weight') || n === 'gold 11 scheme'))
                            details = 'Gold Weight Schemes';
                        else if (n.includes('gold') && (n.includes('value') || n === '11 month gold scheme'))
                            details = 'Gold Value Schemes';
                        else if (n.includes('silver') && (n.includes('weight') || n === 'silver 11 scheme'))
                            details = 'Silver Weight Schemes';
                        else if (n.includes('silver') && (n.includes('value') || n === '11 month silver scheme'))
                            details = 'Silver Value Schemes';
                        else
                            details = pData.name;
                    }
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
                model: 'installment',
                raw: data
            });
        }
        const formattedDigital = [];
        for (const doc of digitalSnap.docs) {
            const data = doc.data();
            const user = await getUser(data.userId);
            formattedDigital.push({
                id: doc.id,
                receiptId: data.receiptId,
                user,
                type: `DIGITAL_${data.metalType}_${data.type}`,
                details: `${(data.weight || 0).toFixed(4)}g`,
                amount: data.amount,
                status: data.status,
                date: data.createdAt,
                model: 'digitalTransaction',
                raw: data
            });
        }
        const formattedRedemptions = [];
        if (redemptionsSnap && !redemptionsSnap.empty) {
            for (const doc of redemptionsSnap.docs) {
                const data = doc.data();
                if (userId && data.userId !== userId)
                    continue;
                const user = await getUser(data.userId);
                let details = 'Scheme Redemption';
                if (data.planId) {
                    const planDoc = await firebase_1.db.collection('plans').doc(data.planId).get();
                    if (planDoc.exists) {
                        const pData = planDoc.data();
                        let n = pData.name?.toLowerCase().trim() || '';
                        if (pData.metalType === 'GOLD' && pData.schemeType === 'VALUE_BASED')
                            details = 'Gold Value Schemes';
                        else if (pData.metalType === 'GOLD' && pData.schemeType === 'WEIGHT_BASED')
                            details = 'Gold Weight Schemes';
                        else if (pData.metalType === 'SILVER' && pData.schemeType === 'VALUE_BASED')
                            details = 'Silver Value Schemes';
                        else if (pData.metalType === 'SILVER' && pData.schemeType === 'WEIGHT_BASED')
                            details = 'Silver Weight Schemes';
                        else
                            details = pData.name;
                    }
                }
                // Use redeemedAt for scheme redemption date
                const redDate = data.redeemedAt || data.updatedAt || data.createdAt || data.startDate;
                formattedRedemptions.push({
                    id: doc.id,
                    receiptId: data.receiptId,
                    user,
                    type: 'SCHEME_REDEEM',
                    details,
                    amount: data.totalPaid || 0,
                    status: 'SUCCESS',
                    date: redDate,
                    model: 'userPlan',
                    raw: data
                });
            }
        }
        const unified = [...formattedInstallments, ...formattedDigital, ...formattedRedemptions]
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
            const installmentRef = firebase_1.db.collection('installments').doc(id);
            const installmentDoc = await installmentRef.get();
            if (!installmentDoc.exists) {
                return res.status(404).json({ success: false, message: 'Installment not found' });
            }
            await installmentRef.update({
                status,
                paidAt: status === 'PAID' ? new Date().toISOString() : null
            });
            // Update the user's plan ledger
            if (status === 'PAID') {
                const installmentData = installmentDoc.data();
                const userPlanRef = firebase_1.db.collection('userPlans').doc(installmentData.userPlanId);
                const userPlanDoc = await userPlanRef.get();
                if (userPlanDoc.exists) {
                    const userPlanData = userPlanDoc.data();
                    const newTotalPaid = (userPlanData.totalPaid || 0) + installmentData.amount;
                    // Push next payment date by 1 month
                    let nextPaymentDate = new Date(userPlanData.nextPaymentDate || userPlanData.startDate);
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                    await userPlanRef.update({
                        totalPaid: newTotalPaid,
                        nextPaymentDate: nextPaymentDate.toISOString()
                    });
                }
            }
            // Send SMS
            if (status === 'PAID' || status === 'FAILED') {
                const installmentData = installmentDoc.data();
                const userDoc = await firebase_1.db.collection('users').doc(installmentData.userId).get();
                const userData = userDoc.data();
                if (userData?.phone) {
                    if (status === 'PAID') {
                        await sms_service_1.smsService.sendPaymentSuccess(userData.phone, userData.name || 'Customer', installmentData.amount.toString());
                    }
                    else {
                        await sms_service_1.smsService.sendPaymentFailed(userData.phone, userData.name || 'Customer', installmentData.amount.toString());
                    }
                }
            }
        }
        else if (model === 'digitalTransaction') {
            const digitalRef = firebase_1.db.collection('digitalTransactions').doc(id);
            const digitalDoc = await digitalRef.get();
            if (!digitalDoc.exists)
                return res.status(404).json({ success: false, message: 'Transaction not found' });
            await digitalRef.update({ status });
            if (status === 'SUCCESS') {
                const txnData = digitalDoc.data();
                if (txnData.type === 'BUY') {
                    const balanceRef = firebase_1.db.collection('digitalBalances').doc(txnData.userId);
                    const balanceDoc = await balanceRef.get();
                    let newGold = 0;
                    let newSilver = 0;
                    if (balanceDoc.exists) {
                        newGold = balanceDoc.data().goldBalance || 0;
                        newSilver = balanceDoc.data().silverBalance || 0;
                    }
                    if (txnData.metalType === 'GOLD')
                        newGold += txnData.weight;
                    if (txnData.metalType === 'SILVER')
                        newSilver += txnData.weight;
                    await balanceRef.set({ goldBalance: newGold, silverBalance: newSilver }, { merge: true });
                    // Send SMS
                    const userDoc = await firebase_1.db.collection('users').doc(txnData.userId).get();
                    const userData = userDoc.data();
                    if (userData?.phone) {
                        if (txnData.metalType === 'GOLD') {
                            await sms_service_1.smsService.sendDigitalGold(userData.phone, userData.name || 'Customer', txnData.weight.toString(), newGold.toString());
                        }
                        else {
                            await sms_service_1.smsService.sendDigitalSilver(userData.phone, userData.name || 'Customer', txnData.weight.toString(), newSilver.toString());
                        }
                    }
                }
            }
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