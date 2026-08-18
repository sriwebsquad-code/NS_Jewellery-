import { Request, Response } from 'express';
import prisma from '../config/db';

// Get current rates
export const getRates = async (req: Request, res: Response) => {
  try {
    const rate = await prisma.metalRate.findFirst({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get rate history (for Admin Panel)
export const getRateHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.metalRate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Get last 50 updates
    });
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update rates (Admin only in real-world, but we'll leave unprotected for this demo)
export const updateRates = async (req: Request, res: Response) => {
  try {
    const { goldRate, silverRate, effectiveDate } = req.body;
    
    if (!goldRate || !silverRate) {
      return res.status(400).json({ success: false, message: 'goldRate and silverRate are required' });
    }

    const parsedGoldRate = parseFloat(goldRate.toString().replace(/,/g, ''));
    const parsedSilverRate = parseFloat(silverRate.toString().replace(/,/g, ''));

    const newRate = await prisma.metalRate.create({
      data: {
        goldRate: parsedGoldRate,
        silverRate: parsedSilverRate,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      }
    });

    // --- SETTLEMENT LOGIC FOR PENDING DIGITAL TRANSACTIONS ---
    const pendingDigitalTransactions = await prisma.digitalTransaction.findMany({
      where: { ratePending: true, status: 'SUCCESS' }
    });

    for (const txn of pendingDigitalTransactions) {
      const rate = txn.metalType === 'GOLD' ? parsedGoldRate : parsedSilverRate;
      const actualWeight = txn.amount / rate;

      await prisma.$transaction(async (tx) => {
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
    const pendingInstallments = await prisma.installment.findMany({
      where: { ratePending: true, status: 'PAID' },
      include: { userPlan: { include: { plan: true } } }
    });

    for (const inst of pendingInstallments) {
      const type = inst.userPlan.plan.type;
      if (type === 'GOLD' || type === 'SILVER') {
        const rate = type === 'GOLD' ? parsedGoldRate : parsedSilverRate;
        const metalWeight = inst.amount / rate;

        await prisma.$transaction(async (tx) => {
          await tx.installment.update({
            where: { id: inst.id },
            data: { metalWeight: metalWeight, ratePending: false }
          });

          await tx.userPlan.update({
            where: { id: inst.userPlanId },
            data: { accumulatedWeight: { increment: metalWeight } }
          });
        });
      } else {
        await prisma.installment.update({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
