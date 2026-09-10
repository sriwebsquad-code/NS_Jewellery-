import app, { db } from '../config/firebase';
import { getNextSequence } from '../utils/counter';

async function fixCustomerIds() {
  console.log('Resetting customer_id counter...');
  await db.collection('counters').doc('customer_id').set({ seq: 0 });

  console.log('Fetching users ordered by createdAt asc...');
  const usersSnap = await db.collection('users').orderBy('createdAt', 'asc').get();
  
  for (const doc of usersSnap.docs) {
    const customId = await getNextSequence('customer_id', 'NSMJCUD');
    await doc.ref.update({ customId });
    console.log('Re-assigned user:', doc.id, '->', customId, 'created at:', doc.data().createdAt);
  }
  
  console.log('Done fixing customer IDs');
}

fixCustomerIds().then(() => process.exit(0)).catch(console.error);
