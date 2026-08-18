"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRates = exports.getRateHistory = exports.getRates = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get current rates
const getRates = async (req, res) => {
    try {
        const rate = await db_1.default.metalRate.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        if (!rate) {
            // Default fallback if no rates are in DB yet
            return res.status(200).json({
                success: true,
                data: {
                    goldRate: 7250,
                    silverRate: 85,
                    updatedAt: new Date(),
                }
            });
        }
        res.status(200).json({
            success: true,
            data: rate
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRates = getRates;
// Get rate history (for Admin Panel)
const getRateHistory = async (req, res) => {
    try {
        const history = await db_1.default.metalRate.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50, // Get last 50 updates
        });
        res.status(200).json({
            success: true,
            data: history
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getRateHistory = getRateHistory;
// Update rates (Admin only in real-world, but we'll leave unprotected for this demo)
const updateRates = async (req, res) => {
    try {
        const { goldRate, silverRate, effectiveDate } = req.body;
        if (!goldRate || !silverRate) {
            return res.status(400).json({ success: false, message: 'goldRate and silverRate are required' });
        }
        const parsedGoldRate = parseFloat(goldRate.toString().replace(/,/g, ''));
        const parsedSilverRate = parseFloat(silverRate.toString().replace(/,/g, ''));
        const newRate = await db_1.default.metalRate.create({
            data: {
                goldRate: parsedGoldRate,
                silverRate: parsedSilverRate,
                effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
            }
        });
        // --- SETTLEMENT LOGIC FOR PENDING DIGITAL TRANSACTIONS ---
        const pendingDigitalTransactions = await db_1.default.digitalTransaction.findMany({
            where: { ratePending: true, status: 'SUCCESS' }
        });
        for (const txn of pendingDigitalTransactions) {
            const rate = txn.metalType === 'GOLD' ? parsedGoldRate : parsedSilverRate;
            const actualWeight = txn.amount / rate;
            await db_1.default.$transaction(async (tx) => {
                await tx.digitalTransaction.update({
                    where: { id: txn.id },
                    data: { weight: actualWeight, ratePending: false }
                });
                const locker = await tx.digitalLocker.findUnique({ where: { userId: txn.userId } });
                if (locker) {
                    await tx.digitalLocker.update({
                        where: { userId: txn.userId },
                        data: {
                            goldBalance: txn.metalType === 'GOLD' ? locker.goldBalance + actualWeight : locker.goldBalance,
                            silverBalance: txn.metalType === 'SILVER' ? locker.silverBalance + actualWeight : locker.silverBalance,
                        }
                    });
                }
            });
        }
        // --- SETTLEMENT LOGIC FOR PENDING INSTALLMENTS ---
        const pendingInstallments = await db_1.default.installment.findMany({
            where: { ratePending: true, status: 'PAID' },
            include: { userPlan: { include: { plan: true } } }
        });
        for (const inst of pendingInstallments) {
            const type = inst.userPlan.plan.type;
            if (type === 'GOLD' || type === 'SILVER') {
                const rate = type === 'GOLD' ? parsedGoldRate : parsedSilverRate;
                const metalWeight = inst.amount / rate;
                await db_1.default.$transaction(async (tx) => {
                    await tx.installment.update({
                        where: { id: inst.id },
                        data: { metalWeight: metalWeight, ratePending: false }
                    });
                    await tx.userPlan.update({
                        where: { id: inst.userPlanId },
                        data: { accumulatedWeight: { increment: metalWeight } }
                    });
                });
            }
            else {
                await db_1.default.installment.update({
                    where: { id: inst.id },
                    data: { ratePending: false }
                });
            }
        }
        res.status(201).json({
            success: true,
            message: `Rates updated successfully. Settled ${pendingDigitalTransactions.length} pending digital transactions and ${pendingInstallments.length} pending installments.`,
            data: newRate
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateRates = updateRates;
//# sourceMappingURL=rates.controller.js.map