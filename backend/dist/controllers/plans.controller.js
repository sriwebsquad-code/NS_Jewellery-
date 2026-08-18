"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPlans = exports.payInstallment = exports.purchasePlan = exports.getPlans = void 0;
const db_1 = __importDefault(require("../config/db"));
const getPlans = async (req, res) => {
    try {
        const goldBenefits = [
            "NO WASTAGE NO MAKING CHARGES FOR THE GOLD WEIGHT ACCUMULATED ONLY AFTER 11MONTHS.",
            "THE PLAN CANNOT BE CLOSED IN BETWEEN. NO BENEFITS WILL BE GIVEN.",
            "THE AMOUNT WILL BE CONVERTED TO WEIGHT AS PER RATE OF GOLD ON THE PAYMENT DATE IF PAID BETWEEN 12.00AM TO THE NEXT MORNING WHEN THE RATE IS UPDATED, IT WILL CALCULATE ON THE NEXT MORNING RATE. NOT ON PREVIOUS DATE RATE.",
            "NOTE: NO ORDERS ACCEPTED FOR JEWELLERY PLANS, READY ITEMS CAN BE PURCHASED WHATEVER ITS WASTAGE MAY BE.",
            "NOTE : DIAMOND ORNAMENTS, SILVER ITEMS,& GIFTS CANNOT BE PURCHASED IN THIS PLANS"
        ];
        const silverBenefits = [
            "NO WASTAGE NO MAKING CHARGES FOR THE SILVER WEIGHT ACCUMULATED ONLY AFTER 11MONTHS.",
            "THE PLAN CANNOT BE CLOSED IN BETWEEN. NO BENEFITS WILL BE GIVEN.",
            "THE AMOUNT WILL BE CONVERTED TO WEIGHT AS PER RATE OF SILVER ON THE PAYMENT DATE IF PAID BETWEEN 12.00AM TO THE NEXT MORNING WHEN THE RATE IS UPDATED, IT WILL CALCULATE ON THE NEXT MORNING RATE. NOT ON PREVIOUS DATE RATE.",
            "NOTE: NO ORDERS ACCEPTED FOR JEWELLERY PLANS, READY ITEMS CAN BE PURCHASED WHATEVER ITS WASTAGE MAY BE.",
            "NOTE : DIAMOND ORNAMENTS, GOLD ITEMS,& GIFTS CANNOT BE PURCHASED IN THIS PLANS"
        ];
        const plans = [
            {
                id: 'mock-11-month-gold',
                name: '11 Month Gold Scheme',
                type: 'AMOUNT',
                monthlyAmount: 1000,
                durationMonths: 11,
                benefits: JSON.stringify(goldBenefits),
                terms: 'Gold bought at 11th month rate',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'mock-gold-11',
                name: 'Gold 11 Scheme',
                type: 'GOLD',
                monthlyAmount: 1000,
                durationMonths: 11,
                benefits: JSON.stringify(goldBenefits),
                terms: 'Subject to daily gold rates',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'mock-11-month-silver',
                name: '11 Month Silver Scheme',
                type: 'AMOUNT',
                monthlyAmount: 1000,
                durationMonths: 11,
                benefits: JSON.stringify(silverBenefits),
                terms: 'Silver bought at 11th month rate',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'mock-silver-11',
                name: 'Silver 11 Scheme',
                type: 'SILVER',
                monthlyAmount: 1000,
                durationMonths: 11,
                benefits: JSON.stringify(silverBenefits),
                terms: 'Subject to daily silver rates',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        res.status(200).json({
            success: true,
            data: plans
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPlans = getPlans;
const purchasePlan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { planId, amount, paymentId } = req.body;
        if (!planId || !amount) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const plan = await db_1.default.savingsPlan.findUnique({ where: { id: planId } });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        // Determine if we are between 12:00 AM and 10:00 AM IST
        const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const currentHour = nowIST.getHours();
        const isRatePending = currentHour >= 0 && currentHour < 10;
        let metalWeight = 0;
        if (!isRatePending && (plan.type === 'GOLD' || plan.type === 'SILVER')) {
            const metalRate = await db_1.default.metalRate.findFirst({
                orderBy: { updatedAt: 'desc' }
            });
            const rate = plan.type === 'GOLD' ? (metalRate?.goldRate || 7250) : (metalRate?.silverRate || 85);
            metalWeight = parseFloat(amount) / rate;
        }
        const result = await db_1.default.$transaction(async (tx) => {
            const nextDueDate = new Date();
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            const userPlan = await tx.userPlan.create({
                data: {
                    userId,
                    planId,
                    status: 'ACTIVE',
                    accumulatedWeight: metalWeight,
                    nextDueDate
                }
            });
            const installment = await tx.installment.create({
                data: {
                    userId,
                    userPlanId: userPlan.id,
                    amount: parseFloat(amount),
                    metalWeight: metalWeight,
                    status: 'PAID',
                    dueDate: new Date(),
                    paidAt: new Date(),
                    transactionId: paymentId || 'mock_txn_' + Date.now(),
                    ratePending: isRatePending
                }
            });
            return { userPlan, installment };
        });
        res.status(200).json({
            success: true,
            message: 'Plan purchased successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.purchasePlan = purchasePlan;
const payInstallment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { userPlanId, amount, paymentId } = req.body;
        if (!userPlanId || !amount)
            return res.status(400).json({ success: false, message: 'Missing fields' });
        const userPlan = await db_1.default.userPlan.findUnique({
            where: { id: userPlanId },
            include: { plan: true }
        });
        if (!userPlan)
            return res.status(404).json({ success: false, message: 'User plan not found' });
        // Determine if we are between 12:00 AM and 10:00 AM IST
        const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const currentHour = nowIST.getHours();
        const isRatePending = currentHour >= 0 && currentHour < 10;
        let metalWeight = 0;
        if (!isRatePending && (userPlan.plan.type === 'GOLD' || userPlan.plan.type === 'SILVER')) {
            const metalRate = await db_1.default.metalRate.findFirst({
                orderBy: { updatedAt: 'desc' }
            });
            const rate = userPlan.plan.type === 'GOLD' ? (metalRate?.goldRate || 7250) : (metalRate?.silverRate || 85);
            metalWeight = parseFloat(amount) / rate;
        }
        const result = await db_1.default.$transaction(async (tx) => {
            // Calculate next due date
            const nextDueDate = new Date(userPlan.nextDueDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            // Create new installment
            const installment = await tx.installment.create({
                data: {
                    userId,
                    userPlanId,
                    amount: parseFloat(amount),
                    metalWeight: metalWeight,
                    status: 'PAID',
                    dueDate: userPlan.nextDueDate,
                    paidAt: new Date(),
                    transactionId: paymentId || 'mock_txn_' + Date.now(),
                    ratePending: isRatePending
                }
            });
            // Update UserPlan accumulated weight & next due date
            const updatedUserPlan = await tx.userPlan.update({
                where: { id: userPlanId },
                data: {
                    accumulatedWeight: { increment: metalWeight },
                    nextDueDate: nextDueDate
                }
            });
            return { installment, updatedUserPlan };
        });
        res.status(200).json({ success: true, message: 'Installment paid', data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.payInstallment = payInstallment;
const seedPlans = async (req, res) => {
    try {
        // Clear and re-seed
        await db_1.default.savingsPlan.deleteMany();
        await db_1.default.savingsPlan.createMany({
            data: [
                {
                    name: '11-Month Swarna Plan',
                    type: 'AMOUNT',
                    monthlyAmount: 2000,
                    durationMonths: 11,
                    benefits: JSON.stringify(["Standard Cash Accumulation"]),
                    terms: 'Standard terms'
                },
                {
                    name: 'Gold 11 Scheme',
                    type: 'GOLD',
                    monthlyAmount: 5000,
                    durationMonths: 11,
                    benefits: JSON.stringify([
                        "Gold weight accumulated based on current live rate",
                        "Zero Wastage & Making Charges"
                    ]),
                    terms: 'Subject to daily gold rates'
                },
                {
                    name: 'Silver 11 Scheme',
                    type: 'SILVER',
                    monthlyAmount: 1000,
                    durationMonths: 11,
                    benefits: JSON.stringify([
                        "Silver weight accumulated based on current live rate",
                        "Zero Wastage & Making Charges"
                    ]),
                    terms: 'Subject to daily silver rates'
                }
            ]
        });
        res.status(200).json({ success: true, message: 'Plans seeded successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.seedPlans = seedPlans;
//# sourceMappingURL=plans.controller.js.map