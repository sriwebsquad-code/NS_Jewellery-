import app, { db } from "../config/firebase";
import { getNextSequence } from "../utils/counter";

async function backfillTransactions() {
  console.log("Starting backfill to update prefixes...");
  
  // Digital Transactions (BUY / SELL / REDEEM)
  const digiSnap = await db.collection("digitalTransactions").get();
  for (const doc of digiSnap.docs) {
    const data = doc.data();
    const basePrefix = data.metalType === "GOLD" ? "Digigold" : "Digisilver";
    let typeStr = "Buy";
    if (data.type === "SELL") typeStr = "Sell";
    else if (data.type === "REDEEM") typeStr = "Redeem";
    
    const prefix = `${typeStr} ${basePrefix}`;
    const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const receiptId = await getNextSequence(counterId, prefix);
    await doc.ref.update({ receiptId });
    console.log("Updated digi:", doc.id, "->", receiptId);
  }

  // Scheme Installments
  const instSnap = await db.collection("installments").get();
  for (const doc of instSnap.docs) {
    const data = doc.data();
    let basePrefix = "Scheme";
    try {
      if (data.userPlanId) {
        const upDoc = await db.collection("userPlans").doc(data.userPlanId).get();
        if (upDoc.exists) {
          const planDoc = await db.collection("plans").doc(upDoc.data()!.planId).get();
          if (planDoc.exists) {
            const pData = planDoc.data()!;
            if (pData.metalType === "GOLD" && pData.schemeType === "VALUE_BASED") basePrefix = "Gold Value Schemes";
            else if (pData.metalType === "GOLD" && pData.schemeType === "WEIGHT_BASED") basePrefix = "Gold Weight Schemes";
            else if (pData.metalType === "SILVER" && pData.schemeType === "VALUE_BASED") basePrefix = "Silver Value Schemes";
            else if (pData.metalType === "SILVER" && pData.schemeType === "WEIGHT_BASED") basePrefix = "Silver Weight Schemes";
            else basePrefix = pData.name || "Scheme";
          }
        }
      }
    } catch (e) {}
    
    const prefix = `Installment ${basePrefix}`;
    const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const receiptId = await getNextSequence(counterId, prefix);
    await doc.ref.update({ receiptId });
    console.log("Updated installment:", doc.id, "->", receiptId);
  }
  
  // Scheme Redemptions
  const userPlanSnap = await db.collection("userPlans").where("status", "==", "REDEEMED").get();
  for (const doc of userPlanSnap.docs) {
    const data = doc.data();
    let basePrefix = "Scheme";
    try {
      const planDoc = await db.collection("plans").doc(data.planId).get();
      if (planDoc.exists) {
        const pData = planDoc.data()!;
        if (pData.metalType === "GOLD" && pData.schemeType === "VALUE_BASED") basePrefix = "Gold Value Schemes";
        else if (pData.metalType === "GOLD" && pData.schemeType === "WEIGHT_BASED") basePrefix = "Gold Weight Schemes";
        else if (pData.metalType === "SILVER" && pData.schemeType === "VALUE_BASED") basePrefix = "Silver Value Schemes";
        else if (pData.metalType === "SILVER" && pData.schemeType === "WEIGHT_BASED") basePrefix = "Silver Weight Schemes";
        else basePrefix = pData.name || "Scheme";
      }
    } catch (e) {}
    
    const prefix = `Redeem ${basePrefix}`;
    const counterId = prefix.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const receiptId = await getNextSequence(counterId, prefix);
    await doc.ref.update({ receiptId });
    console.log("Updated userPlan:", doc.id, "->", receiptId);
  }
  
  console.log("Done with transactions");
}

backfillTransactions().then(() => process.exit(0)).catch(console.error);
