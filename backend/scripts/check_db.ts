import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function check() {
    const userPlansSnap = await db.collection('userPlans').get();
    console.log(`Found ${userPlansSnap.size} userPlans`);
    userPlansSnap.forEach(doc => {
        const data = doc.data();
        if (data.totalPaid === 10000 || data.totalPaid > 0 || data.monthlyAmount === 0 || data.monthlyAmount === undefined) {
            console.log(`userPlan: ${doc.id}`);
            console.log(`- userId: ${data.userId}`);
            console.log(`- planId: ${data.planId}`);
            console.log(`- totalPaid: ${data.totalPaid}`);
            console.log(`- monthlyAmount: ${data.monthlyAmount}`);
        }
    });

    const installmentsSnap = await db.collection('installments').get();
    console.log(`Found ${installmentsSnap.size} installments`);
    installmentsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`installment: ${doc.id}`);
        console.log(`- userPlanId: ${data.userPlanId}`);
        console.log(`- amount: ${data.amount}`);
        console.log(`- status: ${data.status}`);
    });
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
