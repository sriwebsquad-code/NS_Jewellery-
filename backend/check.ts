import { db } from './src/config/firebase';

async function checkPlans() {
  const snapshot = await db.collection('plans').get();
  console.log('Total plans:', snapshot.size);
  for (const doc of snapshot.docs) {
    console.log(doc.id, '=>', doc.data());
  }
  process.exit(0);
}
checkPlans().catch(console.error);
