/**
 * fix_balances.ts
 * 
 * One-time script to recalculate all digital gold/silver balances
 * from actual transaction history, fixing any floating point corruption.
 * 
 * Run with: npx ts-node src/scripts/fix_balances.ts
 */
import { db } from "../config/firebase";

async function fixDigitalBalances() {
  console.log("Starting balance recalculation from transactions...");

  // Fetch all successful BUY transactions
  const txnSnap = await db.collection("digitalTransactions")
    .where("status", "==", "SUCCESS")
    .where("type", "==", "BUY")
    .get();

  // Group by userId
  const balanceMap: Record<string, { goldBalance: number; silverBalance: number }> = {};

  txnSnap.forEach(doc => {
    const data = doc.data();
    const uid = data.userId;
    if (!uid) return;

    if (!balanceMap[uid]) {
      balanceMap[uid] = { goldBalance: 0, silverBalance: 0 };
    }

    const weight = parseFloat(data.weight) || 0;
    if (data.metalType === "GOLD") {
      balanceMap[uid].goldBalance += weight;
    } else if (data.metalType === "SILVER") {
      balanceMap[uid].silverBalance += weight;
    }
  });

  // Round to 4 decimal places to eliminate floating point errors
  for (const uid in balanceMap) {
    const b = balanceMap[uid];
    if (b) {
      b.goldBalance   = parseFloat(b.goldBalance.toFixed(4));
      b.silverBalance = parseFloat(b.silverBalance.toFixed(4));
    }
  }

  // Write corrected balances to Firestore
  let count = 0;
  for (const uid in balanceMap) {
    const oldDoc = await db.collection("digitalBalances").doc(uid).get();
    const oldData = oldDoc.exists ? oldDoc.data() : {};

    const newGold   = balanceMap[uid]?.goldBalance ?? 0;
    const newSilver = balanceMap[uid]?.silverBalance ?? 0;

    console.log(`User ${uid}: gold ${oldData?.goldBalance ?? 0} -> ${newGold} | silver ${oldData?.silverBalance ?? 0} -> ${newSilver}`);

    await db.collection("digitalBalances").doc(uid).set(
      { goldBalance: newGold, silverBalance: newSilver },
      { merge: true }
    );
    count++;
  }

  console.log(`\nDone! Fixed balances for ${count} user(s).`);
}

fixDigitalBalances().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
