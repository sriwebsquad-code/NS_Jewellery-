import { db } from './src/config/firebase';

async function checkUserPlans() {
  try {
    const snapshot = await db.collection('userPlans').get();
    
    // Manually fetch related plans
    const planCache: any = {};
    const formattedPlans: any[] = [];
    
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

    console.log(JSON.stringify(formattedPlans, null, 2));
  } catch (e) {
    console.error(e);
  }
}

checkUserPlans();
