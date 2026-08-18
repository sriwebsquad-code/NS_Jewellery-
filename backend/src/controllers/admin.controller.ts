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

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    let installmentsQuery: any = {};
    if (status) installmentsQuery.status = status;
    
    let digitalQuery: any = {};
    if (status) digitalQuery.status = status;
    if (type) digitalQuery.type = type;

    // Fetch Installments (Schemes)
    const installments = await prisma.installment.findMany({
      where: installmentsQuery,
      include: { user: { select: { name: true, phone: true } }, userPlan: { include: { plan: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Fetch Digital Transactions
    const digitalTxns = await prisma.digitalTransaction.findMany({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { model, status } = req.body;

    if (model === 'installment') {
      await prisma.installment.update({
        where: { id: id as string },
        data: { status: status as any, paidAt: status === 'PAID' ? new Date() : null }
      });
    } else if (model === 'digitalTransaction') {
      await prisma.digitalTransaction.update({
        where: { id: id as string },
        data: { status: status as any }
      });
      // Further logic for locking digital balance happens in rates/settlement, or could happen here if not rate pending
    } else {
      return res.status(400).json({ success: false, message: 'Invalid model type' });
    }

    res.status(200).json({ success: true, message: 'Transaction verified' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
