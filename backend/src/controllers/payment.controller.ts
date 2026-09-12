import { Request, Response } from 'express';
import { cashfreeService } from '../services/cashfree.service';
import { db } from '../config/firebase';
import { smsService } from '../services/sms.service';

const formatPlanName = (name: string, schemeType?: string, metalType?: string) => {
  if (schemeType && metalType) {
    if (metalType === 'GOLD' && schemeType === 'VALUE_BASED') return 'Gold Value Schemes';
    if (metalType === 'GOLD' && schemeType === 'WEIGHT_BASED') return 'Gold Weight Schemes';
    if (metalType === 'SILVER' && schemeType === 'VALUE_BASED') return 'Silver Value Schemes';
    if (metalType === 'SILVER' && schemeType === 'WEIGHT_BASED') return 'Silver Weight Schemes';
  }

  if (!name) return name;
  const n = name.toLowerCase().trim();
  if (n.includes('gold') && (n.includes('weight') || n === 'gold 11 scheme')) return 'Gold Weight Schemes';
  if (n.includes('gold') && (n.includes('value') || n === '11 month gold scheme')) return 'Gold Value Schemes';
  if (n.includes('silver') && (n.includes('weight') || n === 'silver 11 scheme')) return 'Silver Weight Schemes';
  if (n.includes('silver') && (n.includes('value') || n === '11 month silver scheme')) return 'Silver Value Schemes';
  return name;
};

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, itemType, planId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Fetch user details for Cashfree
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const phone = userData?.phone || '9999999999';

    // Generate unique order ID
    const orderId = `ORDER_${userId.substring(0, 5)}_${Date.now()}`;

    // Call Cashfree API
    const result = await cashfreeService.createOrder(orderId, amount, userId, phone);

    if (result.success) {
      // Store pending order in DB
      await db.collection('orders').doc(orderId).set({
        orderId,
        userId,
        amount,
        itemType,
        status: 'PENDING',
        paymentSessionId: result.paymentSessionId,
        createdAt: new Date().toISOString(),
        planId: planId || null
      });

      return res.status(200).json({
        success: true,
        orderId,
        paymentSessionId: result.paymentSessionId,
        environment: result.environment
      });
    }

    return res.status(400).json({ success: false, message: result.message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'Order ID required' });

    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderData = orderDoc.data()!;

    // Call Cashfree to check real status
    const result = await cashfreeService.getOrder(orderId);

    if (result.success && result.status === 'PAID') {
      // Update order status
      await db.collection('orders').doc(orderId).update({
        status: 'PAID',
        paidAt: new Date().toISOString()
      });

      const amount = orderData.amount;
      const planId = orderData.planId;
      const itemType = orderData.itemType; // 'GOLD', 'SILVER', 'AMOUNT'

      let liveRate: number | null = null;
      let rateEffectiveDate: string | null = null;
      if (itemType === 'GOLD' || itemType === 'SILVER') {
        const ratesSnapshot = await db.collection('metalRates').orderBy('createdAt', 'desc').limit(1).get();
        if (!ratesSnapshot.empty) {
          liveRate = itemType === 'GOLD' ? ratesSnapshot.docs[0]!.data()?.goldRate : ratesSnapshot.docs[0]!.data()?.silverRate;
          rateEffectiveDate = ratesSnapshot.docs[0]!.data()?.effectiveDate;
        }
      }

      const paymentTimestamp = new Date();
      const paymentISTString = paymentTimestamp.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const paymentDateIST = new Date(paymentISTString);
      const paymentBusinessDate = `${paymentDateIST.getFullYear()}-${paymentDateIST.getMonth() + 1}-${paymentDateIST.getDate()}`;

      let isRateActive = false;
      if (rateEffectiveDate) {
         const rateEffectiveTimestamp = new Date(rateEffectiveDate);
         const rateISTString = rateEffectiveTimestamp.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
         const rateDateIST = new Date(rateISTString);
         const rateBusinessDate = `${rateDateIST.getFullYear()}-${rateDateIST.getMonth() + 1}-${rateDateIST.getDate()}`;
         
         if (rateBusinessDate === paymentBusinessDate && paymentTimestamp >= rateEffectiveTimestamp) {
             isRateActive = true;
         }
      }

      if (planId) {
        // SCHEME LOGIC (Auto-join if needed, then credit installment)
        let actualUserPlanId = planId;
        let userPlanDoc = await db.collection('userPlans').doc(planId).get();
        
        let isWeightBased = itemType === 'GOLD' || itemType === 'SILVER';

        if (!userPlanDoc.exists) {
          // It's a new join, planId belongs to the global 'plans' collection
          const basePlanDoc = await db.collection('plans').doc(planId).get();
          if (basePlanDoc.exists) {
            const basePlan = basePlanDoc.data()!;
            // See if user already joined this exact plan and it's still ACTIVE
            const existingJoin = await db.collection('userPlans').where('userId', '==', userId).where('planId', '==', planId).get();
            
            let activeJoin = null;
            if (!existingJoin.empty) {
              activeJoin = existingJoin.docs.find(doc => doc.data().status === 'ACTIVE');
            }

            if (activeJoin) {
              actualUserPlanId = activeJoin.id;
              userPlanDoc = activeJoin as any;
            } else {
              // Join now
              const startDate = new Date();
              const endDate = new Date(startDate.getTime() + basePlan.durationMonths * 30 * 24 * 60 * 60 * 1000);
              // Initial next payment date is 1st of current month. 
              // The subsequent payment block will advance this by 1 month to the 1st of the next month.
              const nextPaymentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
              
              const newUserPlanRef = db.collection('userPlans').doc();
              const userPlan = {
                id: newUserPlanRef.id,
                userId,
                planId: planId,
                status: 'ACTIVE',
                totalPaid: 0,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                nextPaymentDate: nextPaymentDate.toISOString(),
                monthlyAmount: basePlan.schemeType === 'WEIGHT_BASED' ? 0 : parseFloat(amount),
                metalType: basePlan.schemeType === 'WEIGHT_BASED' ? itemType : null,
                accumulatedWeight: basePlan.schemeType === 'WEIGHT_BASED' ? 0 : null,
                completedMonths: 0
              };
              
              await newUserPlanRef.set(userPlan);
              actualUserPlanId = newUserPlanRef.id;
              userPlanDoc = await newUserPlanRef.get();
              
              const userDoc = await db.collection('users').doc(userId).get();
              if (userDoc.data()?.phone) {
                await smsService.sendSchemeJoined(userDoc.data()!.phone, userDoc.data()!.name || 'Customer', formatPlanName(basePlan.name, basePlan.schemeType, basePlan.metalType));
              }

              // In-App Notification for Scheme Joined
              try {
                await db.collection('notifications').add({
                  userId,
                  title: 'Scheme Enrollment Successful',
                  message: `Welcome! You have successfully enrolled in the ${formatPlanName(basePlan.name, basePlan.schemeType, basePlan.metalType)} scheme.`,
                  isRead: false,
                  createdAt: new Date().toISOString()
                });
              } catch(e) {
                console.error('Failed to add scheme enrollment notification:', e);
              }
            }
          }
        } else {
          // Re-evaluate if it's weight based in case they passed userPlanId
          if (userPlanDoc.data()!.metalType === 'GOLD' || userPlanDoc.data()!.metalType === 'SILVER') {
             isWeightBased = true;
          }
        }

        if (userPlanDoc.exists) {
          const userPlanData = userPlanDoc.data()!;
          const currentTotalPaid = userPlanData.totalPaid || 0;
          const currentAccumulatedWeight = userPlanData.accumulatedWeight || 0;
          const currentCompletedMonths = userPlanData.completedMonths || 0;
          
          let calculatedWeight = null;
          let installmentStatus = 'PAID';
          let applicableRate = null;
          
          if (isWeightBased) {
             if (isRateActive && liveRate) {
                calculatedWeight = amount / liveRate;
                applicableRate = liveRate;
             } else {
                installmentStatus = 'RATE_PENDING';
             }
          }

          // Create the Installment
          const installmentRef = db.collection('installments').doc();
          await installmentRef.set({
            id: installmentRef.id,
            userId,
            userPlanId: actualUserPlanId,
            amount: parseFloat(amount),
            status: installmentStatus,
            businessDate: paymentBusinessDate,
            paidAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            metalType: isWeightBased ? itemType : null,
            applicableRate: applicableRate,
            calculatedWeight: calculatedWeight,
            eligibleAmount: parseFloat(amount),
            monthNumber: currentCompletedMonths + 1
          });

          // Update userPlans ledger
          let nextPaymentDate = new Date(userPlanData.nextPaymentDate || userPlanData.startDate);
          // Advance by 1 month and force to the 1st of the month
          nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 1);
          
          let durationMonths = 11;
          const planRef = await db.collection('plans').doc(userPlanData.planId).get();
          if (planRef.exists) {
             durationMonths = planRef.data()!.durationMonths || 11;
          }

          const newCompletedMonths = currentCompletedMonths + 1;
          const isCompleted = newCompletedMonths >= durationMonths;

          await db.collection('userPlans').doc(actualUserPlanId).update({
            totalPaid: currentTotalPaid + parseFloat(amount),
            nextPaymentDate: nextPaymentDate.toISOString(),
            completedMonths: newCompletedMonths,
            ...(isCompleted ? { status: 'COMPLETED' } : {}),
            ...(calculatedWeight ? { accumulatedWeight: currentAccumulatedWeight + calculatedWeight } : {})
          });

          // In-App Notification for Scheme Payment
          try {
            const planDetails = planRef.exists ? planRef.data() : { name: 'Scheme' };
            let notificationMessage = '';
            
            if (installmentStatus === 'RATE_PENDING') {
                notificationMessage = `Your payment was successful. Your gold/silver weight is pending today's rate update. Once today's rate is published, your weight will be calculated and added.`;
                const userDoc2 = await db.collection('users').doc(userId).get();
                if (userDoc2.exists && userDoc2.data()?.phone) {
                   await smsService.sendPaymentRatePending(userDoc2.data()!.phone, userDoc2.data()!.name || 'Customer');
                }
            } else {
                notificationMessage = `Your payment of ₹${amount} for ${formatPlanName(planDetails!.name, planDetails!.schemeType, planDetails!.metalType)} (Month ${newCompletedMonths}) was successful.`;
                if (calculatedWeight) {
                  notificationMessage += ` Credited Weight: ${calculatedWeight.toFixed(3)}g.`;
                }
            }
            
            await db.collection('notifications').add({
              userId,
              title: 'Installment Paid Successfully',
              message: notificationMessage,
              isRead: false,
              createdAt: new Date().toISOString()
            });
          } catch(e) {
            console.error('Failed to add scheme payment notification:', e);
          }
        }
      } else if (itemType === 'GOLD' || itemType === 'SILVER') {
        // DIGITAL GOLD/SILVER PURCHASE
        const status = (isRateActive && liveRate) ? 'SUCCESS' : 'RATE_PENDING';
        const metalWeight = (isRateActive && liveRate) ? Number((amount / liveRate).toFixed(3)) : null;

        await db.collection('digitalTransactions').add({
          userId,
          type: 'BUY',
          metalType: itemType,
          weight: metalWeight,
          amount: parseFloat(amount),
          status: status,
          businessDate: paymentBusinessDate,
          createdAt: new Date().toISOString()
        });

        if (isRateActive && liveRate) {
            const balanceRef = db.collection('digitalBalances').doc(userId);
            const balanceDoc = await balanceRef.get();
            const currentBalance: any = balanceDoc.exists ? (balanceDoc.data() || { goldBalance: 0, silverBalance: 0 }) : { goldBalance: 0, silverBalance: 0 };
            
            if (itemType === 'GOLD') {
              currentBalance.goldBalance = parseFloat(((currentBalance.goldBalance || 0) + metalWeight!).toFixed(3));
            } else if (itemType === 'SILVER') {
              currentBalance.silverBalance = parseFloat(((currentBalance.silverBalance || 0) + metalWeight!).toFixed(3));
            }
            
            await balanceRef.set(currentBalance);

            // Send SMS Notification
            const userDoc2 = await db.collection('users').doc(userId).get();
            if (userDoc2.exists && userDoc2.data()?.phone) {
               const userName = userDoc2.data()!.name || 'Customer';
               const phone = userDoc2.data()!.phone;
               
               if (itemType === 'GOLD') {
                   await smsService.sendDigitalGold(phone, userName, metalWeight!.toFixed(3), currentBalance.goldBalance.toFixed(3));
               } else {
                   await smsService.sendDigitalSilver(phone, userName, metalWeight!.toFixed(3), currentBalance.silverBalance.toFixed(3));
               }
            }

            // In-App Notification for Digital Purchase
            try {
              await db.collection('notifications').add({
                userId,
                title: `Digital ${itemType === 'GOLD' ? 'Gold' : 'Silver'} Purchased`,
                message: `Your purchase of ${metalWeight!.toFixed(3)}g Digital ${itemType === 'GOLD' ? 'Gold' : 'Silver'} was successful. It has been added to your Digi Locker.`,
                isRead: false,
                createdAt: new Date().toISOString()
              });
            } catch(e) {
              console.error('Failed to add digital purchase notification:', e);
            }
        } else {
            // RATE_PENDING
            const userDoc2 = await db.collection('users').doc(userId).get();
            if (userDoc2.exists && userDoc2.data()?.phone) {
               await smsService.sendPaymentRatePending(userDoc2.data()!.phone, userDoc2.data()!.name || 'Customer');
            }
            try {
              await db.collection('notifications').add({
                userId,
                title: `Digital ${itemType === 'GOLD' ? 'Gold' : 'Silver'} Payment Successful`,
                message: `Your payment was successful. Your gold/silver weight is pending today's rate update. Once today's rate is published, your weight will be calculated and added.`,
                isRead: false,
                createdAt: new Date().toISOString()
              });
            } catch(e) {}
        }
      }

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    }

    return res.status(400).json({ success: false, message: 'Payment not successful yet' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
};

export const renderCheckoutPage = (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const isProd = process.env.NODE_ENV === 'production';
  const sdkUrl = isProd ? 'https://sdk.cashfree.com/js/v3/cashfree.js' : 'https://sdk.cashfree.com/js/v3/cashfree.js';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Secure Payment Checkout</title>
      <script src="${sdkUrl}"></script>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fcfcfc; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #d4af37; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .container { text-align: center; }
        h3 { color: #333; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loader"></div>
        <h3>Loading Payment Gateway...</h3>
      </div>
      <script>
        const cashfree = Cashfree({ mode: "${isProd ? 'production' : 'sandbox'}" });
        cashfree.checkout({
          paymentSessionId: "${sessionId}",
          redirectTarget: "_self"
        }).then(function(result) {
          if (result.error) {
            // Send message to React Native WebView
            if (window.ReactNativeWebView) {
               window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'PAYMENT_FAILED', error: result.error }));
            }
          }
          if (result.paymentDetails) {
            if (window.ReactNativeWebView) {
               window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'PAYMENT_SUCCESS', details: result.paymentDetails }));
            }
          }
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
};

export const handlePaymentReturn = async (req: Request, res: Response) => {
  const { order_id } = req.query;
  
  // Return an HTML page that posts a message to the React Native WebView
  // This avoids needing a new APK release to handle deep links.
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Return</title>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fcfcfc; }
        h3 { color: #333; }
      </style>
    </head>
    <body>
      <h3>Verifying Payment...</h3>
      <script>
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'PAYMENT_SUCCESS', details: { orderId: "${order_id}" } }));
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
};
