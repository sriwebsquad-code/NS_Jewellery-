import { getNextSequence } from '../utils/counter';
import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { smsService } from '../services/sms.service';

const formatPlanName = (name: string, schemeType?: string, metalType?: string) => {
  if (schemeType && metalType) {
    if (metalType === 'GOLD' && schemeType === 'VALUE_BASED') return 'Gold Value Schemes';
    if (metalType === 'GOLD' && schemeType === 'WEIGHT_BASED') return 'Gold Weight Schemes';
    if (metalType === 'SILVER' && schemeType === 'VALUE_BASED') return 'Silver Value Schemes';
    if (metalType === 'SILVER' && schemeType === 'WEIGHT_BASED') return 'Silver Weight Schemes';
  }

  if (!name) return name;
  const n = name.toLowerCase().trim();
  if (n.includes('gold') && (n.includes('weight') || n === 'gold 11 scheme')) return 'Gold Weight Schemes';
  if (n.includes('gold') && (n.includes('value') || n === '11 month gold scheme')) return 'Gold Value Schemes';
  if (n.includes('silver') && (n.includes('weight') || n === 'silver 11 scheme')) return 'Silver Weight Schemes';
  if (n.includes('silver') && (n.includes('value') || n === '11 month silver scheme')) return 'Silver Value Schemes';
  return name;
};

export const getPlans = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('plans').where('isActive', '==', true).get();
    const plans = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        name: formatPlanName(data.name, data.schemeType, data.metalType)
      };
    });
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

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + planDoc.data()!.durationMonths * 30 * 24 * 60 * 60 * 1000);
    
    // Initial next payment date is 1st of current month. 
    // The subsequent payment block will advance this by 1 month to the 1st of the next month.
    const nextPaymentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    const docRef = db.collection('userPlans').doc();
    const userPlan = {
      id: docRef.id,
      userId,
      planId,
      status: 'ACTIVE',
      monthlyAmount: parseFloat(monthlyAmount),
      totalPaid: 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nextPaymentDate: nextPaymentDate.toISOString()
    };
    
    await docRef.set(userPlan);

    // Send SMS
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (userData?.phone) {
      await smsService.sendSchemeJoined(userData.phone, userData.name || 'Customer', planDoc.data()!.name);
    }

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

      // Dynamically calculate totalPaid and completedMonths from installments (always accurate)
      const instSnap = await db.collection('installments')
        .where('userPlanId', '==', doc.id)
        .where('status', '==', 'PAID')
        .get();
        
      let dynamicTotalPaid = 0;
      let completedMonths = 0;
      
      instSnap.forEach(i => {
         const idata = i.data();
         dynamicTotalPaid += (idata.amount || 0);
         completedMonths += 1;
      });

      // Use stored accumulatedWeight from userPlans — this is the authoritative value
      // maintained precisely by the payment flows (Cashfree & admin verification)
      const accumulatedWeight = parseFloat((data.accumulatedWeight || 0).toFixed(3));

      formattedPlans.push({
        id: doc.id,
        ...data,
        totalPaid: dynamicTotalPaid,
        accumulatedWeight,
        completedMonths,
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

    const userPlanData = userPlanDoc.data()!;
    if (parseFloat(amount) !== userPlanData.monthlyAmount) {
      return res.status(400).json({ success: false, message: `Installment amount must be exactly ₹${userPlanData.monthlyAmount}` });
    }

    let basePrefix = 'Scheme';
    try {
      const planDoc = await db.collection('plans').doc(userPlanData.planId).get();
      if (planDoc.exists) {
        const pData = planDoc.data()!;
        if (pData.metalType === 'GOLD' && pData.schemeType === 'VALUE_BASED') basePrefix = 'Gold Value Schemes';
        else if (pData.metalType === 'GOLD' && pData.schemeType === 'WEIGHT_BASED') basePrefix = 'Gold Weight Schemes';
        else if (pData.metalType === 'SILVER' && pData.schemeType === 'VALUE_BASED') basePrefix = 'Silver Value Schemes';
        else if (pData.metalType === 'SILVER' && pData.schemeType === 'WEIGHT_BASED') basePrefix = 'Silver Weight Schemes';
        else basePrefix = pData.name || 'Scheme';
      }
    } catch (e) {}

    const prefix = `Installment ${basePrefix}`;
    const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const receiptId = await getNextSequence(counterId, prefix);

    const docRef = db.collection('installments').doc();
    const installment = {
      id: docRef.id,
      receiptId,
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

    const userPlanData = userPlanDoc.data()!;

    let basePrefix = 'Scheme';
    try {
      const planDoc = await db.collection('plans').doc(userPlanData.planId).get();
      if (planDoc.exists) {
        const pData = planDoc.data()!;
        if (pData.metalType === 'GOLD' && pData.schemeType === 'VALUE_BASED') basePrefix = 'Gold Value Schemes';
        else if (pData.metalType === 'GOLD' && pData.schemeType === 'WEIGHT_BASED') basePrefix = 'Gold Weight Schemes';
        else if (pData.metalType === 'SILVER' && pData.schemeType === 'VALUE_BASED') basePrefix = 'Silver Value Schemes';
        else if (pData.metalType === 'SILVER' && pData.schemeType === 'WEIGHT_BASED') basePrefix = 'Silver Weight Schemes';
        else basePrefix = pData.name || 'Scheme';
      }
    } catch (e) {
      console.error('Error fetching plan for prefix:', e);
    }
    
    // Create a safe counterId from prefix (lowercase, no spaces)
    const prefix = `Redeem ${basePrefix}`;
    const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const receiptId = await getNextSequence(counterId, prefix);

    await userPlanRef.update({
      status: 'REDEEMED',
      receiptId,
      redeemedAt: new Date().toISOString()
    });

    // Send Notifications
    try {
      const userDoc = await db.collection('users').doc(userPlanData.userId).get();
      const planDoc = await db.collection('plans').doc(userPlanData.planId).get();
      
      if (userDoc.exists && planDoc.exists) {
        const userData = userDoc.data()!;
        const planData = planDoc.data()!;
        
        if (userData.phone) {
          await smsService.sendSchemeRedeemed(userData.phone, userData.name || 'Customer', formatPlanName(planData.name));
        }

        await db.collection('notifications').add({
          userId: userPlanData.userId,
          title: `Scheme Redeemed`,
          message: `Your scheme '${formatPlanName(planData.name)}' has been successfully redeemed at our store! Thank you for saving with NS Mahaveer Jewellery.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch(e) {
      console.error('Failed to send scheme redemption notifications', e);
    }

    res.status(200).json({ success: true, message: 'Plan redeemed successfully', receiptId });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to redeem scheme', error: error.message });
  }
};
