"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
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
//# sourceMappingURL=admin.controller.js.map