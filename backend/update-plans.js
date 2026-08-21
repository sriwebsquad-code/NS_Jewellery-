const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updatePlans() {
  const snapshot = await db.collection('plans').get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`Found plan: ${data.name}`);
    if (data.name === 'Silver 11 Scheme') {
      await doc.ref.update({ schemeType: 'WEIGHT_BASED', metalType: 'SILVER' });
      console.log('Updated Silver 11 Scheme to WEIGHT_BASED / SILVER');
    } else if (data.name === 'Gold 11 Scheme') {
      await doc.ref.update({ schemeType: 'WEIGHT_BASED', metalType: 'GOLD' });
      console.log('Updated Gold 11 Scheme to WEIGHT_BASED / GOLD');
    } else if (data.name === '11 Month Silver Scheme') {
      await doc.ref.update({ schemeType: 'VALUE_BASED', metalType: 'SILVER' });
      console.log('Updated 11 Month Silver Scheme to VALUE_BASED / SILVER');
    } else if (data.name === '11 Month Gold Scheme') {
      await doc.ref.update({ schemeType: 'VALUE_BASED', metalType: 'GOLD' });
      console.log('Updated 11 Month Gold Scheme to VALUE_BASED / GOLD');
    }
  }
  console.log('Done!');
  process.exit(0);
}

updatePlans().catch(console.error);
