import { db } from './src/config/firebase';

const fix = async () => {
  const snapshot = await db.collection('plans').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let newName = '';
    
    if (data.metalType === 'GOLD' && data.schemeType === 'VALUE_BASED') newName = 'Gold Value Schemes';
    if (data.metalType === 'GOLD' && data.schemeType === 'WEIGHT_BASED') newName = 'Gold Weight Schemes';
    if (data.metalType === 'SILVER' && data.schemeType === 'VALUE_BASED') newName = 'Silver Value Schemes';
    if (data.metalType === 'SILVER' && data.schemeType === 'WEIGHT_BASED') newName = 'Silver Weight Schemes';

    if (newName && data.name !== newName) {
      await doc.ref.update({ name: newName });
      count++;
      console.log('Updated ' + data.name + ' to ' + newName);
    }
  }
  console.log('Updated ' + count + ' plans.');
};

fix().then(() => process.exit(0)).catch(console.error);
