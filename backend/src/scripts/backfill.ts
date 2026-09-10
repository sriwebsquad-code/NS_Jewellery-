import app, { db } from '../config/firebase';
import { getNextSequence } from '../utils/counter';

async function backfillUsers() {
  console.log('Starting backfill for users...');
  
  const usersSnap = await db.collection('users').get();
  
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (!data.customId) {
      const customId = await getNextSequence('customer_id', 'NSMJCUD');
      await doc.ref.update({ customId });
      console.log('Updated user:', doc.id, '->', customId);
    }
  }
  
  console.log('Done with users');
}

backfillUsers().then(() => process.exit(0)).catch(console.error);
