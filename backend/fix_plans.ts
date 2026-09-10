import { db } from './src/config/firebase';

const fix = async () => {
  const snapshot = await db.collection('plans').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let newName = '';
    let mType = '';
    let sType = '';

    const n = data.name.toLowerCase();
    
    if (n.includes('gold') && (n.includes('weight') || n === 'gold 11 scheme')) {
      newName = 'Gold Weight Schemes';
      mType = 'GOLD';
      sType = 'WEIGHT_BASED';
    } else if (n.includes('gold') && (n.includes('value') || n === '11 month gold scheme')) {
      newName = 'Gold Value Schemes';
      mType = 'GOLD';
      sType = 'VALUE_BASED';
    } else if (n.includes('silver') && (n.includes('weight') || n === 'silver 11 scheme')) {
      newName = 'Silver Weight Schemes';
      mType = 'SILVER';
      sType = 'WEIGHT_BASED';
    } else if (n.includes('silver') && (n.includes('value') || n === '11 month silver scheme')) {
      newName = 'Silver Value Schemes';
      mType = 'SILVER';
      sType = 'VALUE_BASED';
    }

    if (newName) {
      await doc.ref.update({ 
        name: newName,
        metalType: mType,
        schemeType: sType
      });
      count++;
      console.log(`Updated ${data.name} to ${newName} (${mType}/${sType})`);
    }
  }
  console.log('Updated ' + count + ' plans.');
};

fix().then(() => process.exit(0)).catch(console.error);
