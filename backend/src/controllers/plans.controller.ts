import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('plans').where('isActive', '==', true).get();
    const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans', error: error.message });
  }
};

  export const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, durationMonths, minAmount, schemeType, metalType } = req.body;
    if (!name || !durationMonths || !minAmount || !schemeType || !metalType) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    if (!['VALUE_BASED', 'WEIGHT_BASED'].includes(schemeType)) {
      return res.status(400).json({ success: false, message: 'Invalid schemeType' });
    }

    if (!['GOLD', 'SILVER'].includes(metalType)) {
      return res.status(400).json({ success: false, message: 'Invalid metalType' });
    }

    const docRef = db.collection('plans').doc();
    const plan = {
      id: docRef.id,
      name,
      durationMonths: parseInt(durationMonths),
      minAmount: parseFloat(minAmount),
      schemeType,
      metalType,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    await docRef.set(plan);

    res.status(201).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create plan', error: error.message });
  }
};

export const joinPlan = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { planId, monthlyAmount } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const planDoc = await db.collection('plans').doc(planId).get();
    if (!planDoc.exists) return res.status(404).json({ success: false, message: 'Plan not found' });

    const docRef = db.collection('userPlans').doc();
    const userPlan = {
      id: docRef.id,
      userId,
      planId,
      status: 'ACTIVE',
      monthlyAmount: parseFloat(monthlyAmount),
      totalPaid: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + planDoc.data()!.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    await docRef.set(userPlan);

    res.status(201).json({ success: true, message: 'Joined scheme successfully', data: userPlan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to join plan', error: error.message });
  }
};

export const getUserPlans = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const snapshot = await db.collection('userPlans').where('userId', '==', userId).get();
    
    // Manually fetch related plans
    const planCache: any = {};
    const formattedPlans = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!planCache[data.planId]) {
        const p = await db.collection('plans').doc(data.planId).get();
        planCache[data.planId] = p.data();
      }
      formattedPlans.push({
        id: doc.id,
        ...data,
        plan: planCache[data.planId]
      });
    }

    res.status(200).json({ success: true, data: formattedPlans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user plans', error: error.message });
  }
};

export const payInstallment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { userPlanId, amount } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userPlanDoc = await db.collection('userPlans').doc(userPlanId).get();
    if (!userPlanDoc.exists || userPlanDoc.data()!.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Invalid plan' });
    }

    const docRef = db.collection('installments').doc();
    const installment = {
      id: docRef.id,
      userId,
      userPlanId,
      amount: parseFloat(amount),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    
    await docRef.set(installment);

    res.status(201).json({ success: true, message: 'Payment submitted and pending verification', data: installment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Payment failed', error: error.message });
  }
};

export const getPlanUsers = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;

    // 1. Fetch userPlans for this plan
    const userPlansSnapshot = await db.collection('userPlans').where('planId', '==', planId).get();
    
    if (userPlansSnapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Collect unique user IDs
    const userIds = new Set<string>();
    const userPlansData = userPlansSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      userIds.add(data.userId);
      return { id: doc.id, ...data };
    });

    // 3. Fetch user details for these users
    // Firestore 'in' query has a limit of 10, so we will fetch all users and filter, or fetch one by one if there are few.
    // For an admin panel with potentially many users, getting all users and mapping is safer than 10-limit queries.
    const usersSnapshot = await db.collection('users').get();
    const usersMap: Record<string, any> = {};
    
    usersSnapshot.docs.forEach(doc => {
      if (userIds.has(doc.id)) {
        const userData = doc.data();
        delete userData.mpin; // Don't expose mpin
        usersMap[doc.id] = { id: doc.id, ...userData };
      }
    });

    // 4. Combine data
    const result = userPlansData.map(up => ({
      ...up,
      user: usersMap[up.userId] || null
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch plan users', error: error.message });
  }
};

export const getUserPlanTransactions = async (req: Request, res: Response) => {
  try {
    const { userPlanId } = req.params;

    const snapshot = await db.collection('installments').where('userPlanId', '==', userPlanId).get();
    
    if (snapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in descending order of createdAt
    transactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

export const getMyPlanTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userPlanId = req.params.userPlanId as string;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userPlanDoc = await db.collection('userPlans').doc(userPlanId).get();
    if (!userPlanDoc.exists || userPlanDoc.data()!.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const snapshot = await db.collection('installments').where('userPlanId', '==', userPlanId).get();
    
    if (snapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in descending order of createdAt
    transactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: error.message });
  }
};

export const redeemUserPlan = async (req: Request, res: Response) => {
  try {
    const userPlanId = req.params.userPlanId as string;

    const userPlanRef = db.collection('userPlans').doc(userPlanId);
    const userPlanDoc = await userPlanRef.get();

    if (!userPlanDoc.exists) {
      return res.status(404).json({ success: false, message: 'User plan not found' });
    }

    await userPlanRef.update({
      status: 'REDEEMED',
      redeemedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: 'Scheme redeemed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to redeem scheme', error: error.message });
  }
};
