import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './firebase-service-account.json';

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const seedPlans = async () => {
  const goldBenefits = [
    "NO WASTAGE NO MAKING CHARGES FOR THE GOLD WEIGHT ACCUMULATED ONLY AFTER 11MONTHS.",
    "THE PLAN CANNOT BE CLOSED IN BETWEEN. NO BENEFITS WILL BE GIVEN.",
    "THE AMOUNT WILL BE CONVERTED TO WEIGHT AS PER RATE OF GOLD ON THE PAYMENT DATE IF PAID BETWEEN 12.00AM TO THE NEXT MORNING WHEN THE RATE IS UPDATED, IT WILL CALCULATE ON THE NEXT MORNING RATE. NOT ON PREVIOUS DATE RATE.",
    "NOTE: NO ORDERS ACCEPTED FOR JEWELLERY PLANS, READY ITEMS CAN BE PURCHASED WHATEVER ITS WASTAGE MAY BE.",
    "NOTE : DIAMOND ORNAMENTS, SILVER ITEMS,& GIFTS CANNOT BE PURCHASED IN THIS PLANS"
  ];
  const silverBenefits = [
    "NO WASTAGE NO MAKING CHARGES FOR THE SILVER WEIGHT ACCUMULATED ONLY AFTER 11MONTHS.",
    "THE PLAN CAN,NOT BE CLOSED IN BETWEEN. NO BENEFITS WILL BE GIVEN.",
    "THE AMOUNT WILL BE CONVERTED TO WEIGHT AS PER RATE OF SILVER ON THE PAYMENT DATE IF PAID BETWEEN 12.00AM TO THE NEXT MORNING WHEN THE RATE IS UPDATED, IT WILL CALCULATE ON THE NEXT MORNING RATE. NOT ON PREVIOUS DATE RATE.",
    "NOTE: NO ORDERS ACCEPTED FOR JEWELLERY PLANS, READY ITEMS CAN BE PURCHASED WHATEVER ITS WASTAGE MAY BE.",
    "NOTE : DIAMOND ORNAMENTS, GOLD ITEMS,& GIFTS CANNOT BE PURCHASED IN THIS PLANS"
  ];

  const plans = [
    { name: '11 Month Gold Scheme', type: 'AMOUNT', durationMonths: 11, benefits: JSON.stringify(goldBenefits), minAmount: 1000, isActive: true },
    { name: 'Gold 11 Scheme', type: 'GOLD', durationMonths: 11, benefits: JSON.stringify(goldBenefits), minAmount: 1000, isActive: true },
    { name: '11 Month Silver Scheme', type: 'AMOUNT', durationMonths: 11, benefits: JSON.stringify(silverBenefits), minAmount: 1000, isActive: true },
    { name: 'Silver 11 Scheme', type: 'SILVER', durationMonths: 11, benefits: JSON.stringify(silverBenefits), minAmount: 1000, isActive: true }
  ];

  for (const plan of plans) {
    await db.collection('plans').add(plan);
    console.log(`Added plan: ${plan.name}`);
  }
  
  console.log('Done seeding plans!');
  process.exit(0);
};

seedPlans();
