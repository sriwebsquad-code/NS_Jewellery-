import { Request, Response } from 'express';
import { cashfreeService } from '../services/cashfree.service';
import { db } from '../config/firebase';

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, itemType } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Fetch user details for Cashfree
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const phone = userData?.phone || '9999999999';

    // Generate unique order ID
    const orderId = `ORDER_${userId.substring(0,5)}_${Date.now()}`;

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
        createdAt: new Date().toISOString()
      });

      return res.status(200).json({ 
        success: true, 
        orderId, 
        paymentSessionId: result.paymentSessionId 
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

      // Here you would typically fulfill the order (e.g. add gold balance)
      // depending on orderData.itemType

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
