"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyDigitalCoin = exports.getLocker = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get locker balances
const getLocker = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        let locker = await db_1.default.digitalLocker.findUnique({
            where: { userId }
        });
        // Create a locker if none exists
        if (!locker) {
            locker = await db_1.default.digitalLocker.create({
                data: { userId, goldBalance: 0, silverBalance: 0, totalInvestedGold: 0, totalInvestedSilver: 0 }
            });
        }
        // Get current rates for Valuation
        const rateRecord = await db_1.default.metalRate.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        // Fallback rates if DB is empty
        const currentGoldRate = rateRecord?.goldRate || 7250;
        const currentSilverRate = rateRecord?.silverRate || 85;
        // Calculate Gold Metrics
        // Base 24K price used for gold valuation as digital gold is typically 24K 99.9%
        const currentGoldValue = locker.goldBalance * currentGoldRate;
        const goldProfitLoss = currentGoldValue - locker.totalInvestedGold;
        // Calculate Silver Metrics
        const currentSilverValue = locker.silverBalance * currentSilverRate;
        const silverProfitLoss = currentSilverValue - locker.totalInvestedSilver;
        // Get transactions
        const transactions = await db_1.default.digitalTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        // Get plan installments
        const installments = await db_1.default.installment.findMany({
            where: { userId },
            include: {
                userPlan: {
                    include: {
                        plan: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            success: true,
            data: {
                locker: {
                    ...locker,
                    currentGoldValue,
                    goldProfitLoss,
                    currentSilverValue,
                    silverProfitLoss
                },
                transactions,
                installments,
                currentRates: {
                    goldRate: currentGoldRate,
                    silverRate: currentSilverRate
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getLocker = getLocker;
// Buy digital gold/silver
const buyDigitalCoin = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { metalType, weight, amount, paymentId } = req.body;
        if (!metalType || !weight || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        // Determine if we are between 12:00 AM and 10:00 AM IST
        const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const currentHour = nowIST.getHours();
        const isRatePending = currentHour >= 0 && currentHour < 10;
        // Override weight if rate is pending
        const actualWeight = isRatePending ? 0 : parseFloat(weight);
        // Wrap in a transaction to ensure both records are created
        const result = await db_1.default.$transaction(async (tx) => {
            // 1. Create transaction record
            const transaction = await tx.digitalTransaction.create({
                data: {
                    userId,
                    type: 'BUY',
                    metalType,
                    weight: actualWeight,
                    amount: parseFloat(amount),
                    status: 'SUCCESS',
                    transactionId: paymentId || 'mock_txn_' + Date.now(),
                    ratePending: isRatePending
                }
            });
            // 2. Update locker
            let locker = await tx.digitalLocker.findUnique({
                where: { userId }
            });
            if (!locker) {
                locker = await tx.digitalLocker.create({
                    data: {
                        userId,
                        goldBalance: metalType === 'GOLD' ? actualWeight : 0,
                        silverBalance: metalType === 'SILVER' ? actualWeight : 0,
                        totalInvestedGold: metalType === 'GOLD' ? parseFloat(amount) : 0,
                        totalInvestedSilver: metalType === 'SILVER' ? parseFloat(amount) : 0
                    }
                });
            }
            else {
                locker = await tx.digitalLocker.update({
                    where: { userId },
                    data: {
                        goldBalance: metalType === 'GOLD' ? locker.goldBalance + actualWeight : locker.goldBalance,
                        silverBalance: metalType === 'SILVER' ? locker.silverBalance + actualWeight : locker.silverBalance,
                        totalInvestedGold: metalType === 'GOLD' ? locker.totalInvestedGold + parseFloat(amount) : locker.totalInvestedGold,
                        totalInvestedSilver: metalType === 'SILVER' ? locker.totalInvestedSilver + parseFloat(amount) : locker.totalInvestedSilver,
                    }
                });
            }
            // 3. Trigger a notification (mocked for now, just inserting to DB)
            const message = isRatePending
                ? `Your payment of ₹${parseFloat(amount).toFixed(2)} for ${metalType} is successful. Weight will be calculated and added after 10:00 AM today.`
                : `You have successfully purchased ${actualWeight.toFixed(3)}g of ${metalType} for ₹${parseFloat(amount).toFixed(2)}.`;
            await tx.notification.create({
                data: {
                    userId,
                    title: 'Purchase Successful',
                    message: message,
                    type: 'PURCHASE_SUCCESS'
                }
            });
            return { transaction, locker, isRatePending };
        });
        res.status(200).json({
            success: true,
            message: `${metalType} purchased successfully`,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.buyDigitalCoin = buyDigitalCoin;
//# sourceMappingURL=digital.controller.js.map