import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });

    const activePlans = await prisma.userPlan.count({
      where: { status: 'ACTIVE' }
    });

    const totalJewellery = await prisma.jewelleryItem.count();

    // For Monthly Revenue, let's just mock it or calculate sum of paid installments in the last month
    // Wait, the schema has Installment model
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const paidInstallments = await prisma.installment.aggregate({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
