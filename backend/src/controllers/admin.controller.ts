import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const usersSnapshot = await db.collection('users').where('role', '==', 'CUSTOMER').get();
    const totalUsers = usersSnapshot.size;

    const plansSnapshot = await db.collection('userPlans').where('status', '==', 'ACTIVE').get();
    const activePlans = plansSnapshot.size;

    const jewellerySnapshot = await db.collection('jewelleryItems').get();
    const totalJewellery = jewellerySnapshot.size;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const installmentsSnapshot = await db.collection('installments')
      .where('status', '==', 'PAID')
      .where('paidAt', '>=', startOfMonth.toISOString())
      .get();

    let monthlyRevenue = 0;
    installmentsSnapshot.forEach(doc => {
      monthlyRevenue += (doc.data().amount || 0);
    });

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
    const userId = req.query.userId as string | undefined;

    let installmentsRef: any = db.collection('installments');
    if (status) installmentsRef = installmentsRef.where('status', '==', status);
    if (userId) installmentsRef = installmentsRef.where('userId', '==', userId);

    let digitalRef: any = db.collection('digitalTransactions');
    if (status) digitalRef = digitalRef.where('status', '==', status);
    if (type) digitalRef = digitalRef.where('type', '==', type);
    if (userId) digitalRef = digitalRef.where('userId', '==', userId);

    const [installmentsSnap, digitalSnap] = await Promise.all([
      installmentsRef.limit(100).get(),
      digitalRef.limit(100).get()
    ]);

    // Manual population of user details since it's NoSQL
    const userCache: any = {};
    const getUser = async (userId: string) => {
      if (userCache[userId]) return userCache[userId];
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        userCache[userId] = { name: userDoc.data()?.name, phone: userDoc.data()?.phone };
      } else {
        userCache[userId] = { name: 'Unknown', phone: 'Unknown' };
      }
      return userCache[userId];
    };

    const formattedInstallments = [];
    for (const doc of installmentsSnap.docs) {
      const data = doc.data();
      const user = await getUser(data.userId);
      
      let details = 'Scheme Installment';
      if (data.userPlanId) {
        const userPlanDoc = await db.collection('userPlans').doc(data.userPlanId).get();
        if (userPlanDoc.exists && userPlanDoc.data()?.planId) {
          const planDoc = await db.collection('plans').doc(userPlanDoc.data()?.planId).get();
          details = planDoc.exists ? planDoc.data()?.name : details;
        }
      }

      formattedInstallments.push({
        id: doc.id,
        user,
        type: 'SCHEME_INSTALLMENT',
        details,
        amount: data.amount,
        status: data.status,
        date: data.createdAt,
        model: 'installment'
      });
    }

    const formattedDigital = [];
    for (const doc of digitalSnap.docs) {
      const data = doc.data();
      const user = await getUser(data.userId);
      
      formattedDigital.push({
        id: doc.id,
        user,
        type: `DIGITAL_${data.metalType}_${data.type}`,
        details: `${(data.weight || 0).toFixed(2)}g`,
        amount: data.amount,
        status: data.status,
        date: data.createdAt,
        model: 'digitalTransaction'
      });
    }

    const unified = [...formattedInstallments, ...formattedDigital]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({ success: true, data: unified });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyTransaction = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { model, status } = req.body;

    if (model === 'installment') {
      const installmentRef = db.collection('installments').doc(id);
      const installmentDoc = await installmentRef.get();
      
      if (!installmentDoc.exists) {
        return res.status(404).json({ success: false, message: 'Installment not found' });
      }

      await installmentRef.update({
        status,
        paidAt: status === 'PAID' ? new Date().toISOString() : null
      });

      // Update the user's plan ledger
      if (status === 'PAID') {
        const installmentData = installmentDoc.data()!;
        const userPlanRef = db.collection('userPlans').doc(installmentData.userPlanId);
        const userPlanDoc = await userPlanRef.get();
        
        if (userPlanDoc.exists) {
          const userPlanData = userPlanDoc.data()!;
          const newTotalPaid = (userPlanData.totalPaid || 0) + installmentData.amount;
          
          // Push next payment date by 1 month
          let nextPaymentDate = new Date(userPlanData.nextPaymentDate || userPlanData.startDate);
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

          await userPlanRef.update({
            totalPaid: newTotalPaid,
            nextPaymentDate: nextPaymentDate.toISOString()
          });
        }
      }
    } else if (model === 'digitalTransaction') {
      await db.collection('digitalTransactions').doc(id).update({ status });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid model type' });
    }

    res.status(200).json({ success: true, message: 'Transaction verified' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
