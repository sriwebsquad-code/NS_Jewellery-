import { db } from './src/config/firebase';

async function checkDigitalBalances() {
  try {
    const snapshot = await db.collection('digitalBalances').get();
    snapshot.docs.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch (e) {
    console.error(e);
  }
}

checkDigitalBalances();
