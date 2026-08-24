"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = void 0;
const cashfree_service_1 = require("../services/cashfree.service");
const firebase_1 = require("../config/firebase");
const createPaymentOrder = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { amount, itemType } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }
        // Fetch user details for Cashfree
        const userDoc = await firebase_1.db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const phone = userData?.phone || '9999999999';
        // Generate unique order ID
        const orderId = `ORDER_${userId.substring(0, 5)}_${Date.now()}`;
        // Call Cashfree API
        const result = await cashfree_service_1.cashfreeService.createOrder(orderId, amount, userId, phone);
        if (result.success) {
            // Store pending order in DB
            await firebase_1.db.collection('orders').doc(orderId).set({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
    }
};
exports.createPaymentOrder = createPaymentOrder;
const verifyPayment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { orderId } = req.body;
        if (!orderId)
            return res.status(400).json({ success: false, message: 'Order ID required' });
        const orderDoc = await firebase_1.db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const orderData = orderDoc.data();
        // Call Cashfree to check real status
        const result = await cashfree_service_1.cashfreeService.getOrder(orderId);
        if (result.success && result.status === 'PAID') {
            // Update order status
            await firebase_1.db.collection('orders').doc(orderId).update({
                status: 'PAID',
                paidAt: new Date().toISOString()
            });
            // Here you would typically fulfill the order (e.g. add gold balance)
            // depending on orderData.itemType
            return res.status(200).json({ success: true, message: 'Payment verified successfully' });
        }
        return res.status(400).json({ success: false, message: 'Payment not successful yet' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
    }
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=payment.controller.js.map