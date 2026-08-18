"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransaction = exports.getTransactions = exports.getDashboardStats = void 0;
const db_1 = __importDefault(require("../config/db"));
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await db_1.default.user.count({
            where: { role: 'CUSTOMER' }
        });
        const activePlans = await db_1.default.userPlan.count({
            where: { status: 'ACTIVE' }
        });
        const totalJewellery = await db_1.default.jewelleryItem.count();
        // For Monthly Revenue, let's just mock it or calculate sum of paid installments in the last month
        // Wait, the schema has Installment model
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const paidInstallments = await db_1.default.installment.aggregate({
            _sum: { amount: true },
            where: {
                status: 'PAID',
                paidAt: { gte: startOfMonth }
            }
        });
        const monthlyRevenue = paidInstallments._sum.amount || 0;
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
        let installmentsQuery = {};
        if (status)
            installmentsQuery.status = status;
        let digitalQuery = {};
        if (status)
            digitalQuery.status = status;
        if (type)
            digitalQuery.type = type;
        // Fetch Installments (Schemes)
        const installments = await db_1.default.installment.findMany({
            where: installmentsQuery,
            include: { user: { select: { name: true, phone: true } }, userPlan: { include: { plan: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        // Fetch Digital Transactions
        const digitalTxns = await db_1.default.digitalTransaction.findMany({
            where: digitalQuery,
            include: { user: { select: { name: true, phone: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        // Format them to be unified
        const unified = [
            ...installments.map(i => ({
                id: i.id,
                user: i.user,
                type: 'SCHEME_INSTALLMENT',
                details: i.userPlan.plan.name,
                amount: i.amount,
                status: i.status,
                date: i.createdAt,
                model: 'installment'
            })),
            ...digitalTxns.map(d => ({
                id: d.id,
                user: d.user,
                type: `DIGITAL_${d.metalType}_${d.type}`,
                details: `${d.weight.toFixed(2)}g`,
                amount: d.amount,
                status: d.status,
                date: d.createdAt,
                model: 'digitalTransaction'
            }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime());
        res.status(200).json({ success: true, data: unified });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTransactions = getTransactions;
const verifyTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { model, status } = req.body;
        if (model === 'installment') {
            await db_1.default.installment.update({
                where: { id: id },
                data: { status: status, paidAt: status === 'PAID' ? new Date() : null }
            });
        }
        else if (model === 'digitalTransaction') {
            await db_1.default.digitalTransaction.update({
                where: { id: id },
                data: { status: status }
            });
            // Further logic for locking digital balance happens in rates/settlement, or could happen here if not rate pending
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