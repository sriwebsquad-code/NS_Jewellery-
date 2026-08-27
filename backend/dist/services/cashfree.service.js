"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashfreeService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CashfreeService {
    pgAppId;
    pgSecretKey;
    verifyAppId;
    verifySecretKey;
    pgBaseUrl;
    verifyBaseUrl;
    constructor() {
        this.pgAppId = process.env.CASHFREE_APP_ID || '';
        this.pgSecretKey = process.env.CASHFREE_SECRET_KEY || '';
        // Support separate keys for Verification Suite, fallback to PG keys if not provided
        this.verifyAppId = process.env.CASHFREE_VERIFY_APP_ID || this.pgAppId;
        this.verifySecretKey = process.env.CASHFREE_VERIFY_SECRET_KEY || this.pgSecretKey;
        // Automatically switch between Sandbox and Production based on Render environment
        const isProd = process.env.NODE_ENV === 'production';
        this.pgBaseUrl = isProd ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
        this.verifyBaseUrl = isProd ? 'https://api.cashfree.com/verification' : 'https://sandbox.cashfree.com/verification';
    }
    get pgHeaders() {
        return {
            'x-client-id': this.pgAppId,
            'x-client-secret': this.pgSecretKey,
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01'
        };
    }
    get verifyHeaders() {
        return {
            'x-client-id': this.verifyAppId,
            'x-client-secret': this.verifySecretKey,
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01'
        };
    }
    // ==========================================
    // IDENTITY VERIFICATION (KYC)
    // ==========================================
    async verifyPAN(panNumber, name) {
        try {
            const response = await fetch(`${this.verifyBaseUrl}/pan`, {
                method: 'POST',
                headers: this.verifyHeaders,
                body: JSON.stringify({
                    pan: panNumber,
                    name: name
                })
            });
            const data = await response.json();
            // Basic check for valid PAN
            if (data.valid === true) {
                return { success: true, name: data.registered_name || name, data };
            }
            return { success: false, message: data.message || 'Invalid PAN', data };
        }
        catch (error) {
            console.error('PAN Verification Error:', error);
            return { success: false, message: 'Verification service unavailable' };
        }
    }
    async requestAadhaarOTP(aadhaarNumber) {
        try {
            const response = await fetch(`${this.verifyBaseUrl}/offline-aadhaar/otp`, {
                method: 'POST',
                headers: this.verifyHeaders,
                body: JSON.stringify({ aadhaar_number: aadhaarNumber })
            });
            const data = await response.json();
            if (response.ok) {
                return { success: true, ref_id: data.ref_id, message: data.message };
            }
            return { success: false, message: data.message || 'Failed to send Aadhaar OTP' };
        }
        catch (error) {
            console.error('Aadhaar OTP Error:', error);
            return { success: false, message: 'Aadhaar OTP service unavailable' };
        }
    }
    async verifyAadhaarOTP(refId, otp) {
        try {
            const response = await fetch(`${this.verifyBaseUrl}/offline-aadhaar/verify`, {
                method: 'POST',
                headers: this.verifyHeaders,
                body: JSON.stringify({ ref_id: refId, otp })
            });
            const data = await response.json();
            if (response.ok && data.status === 'VALID') {
                return { success: true, data };
            }
            return { success: false, message: data.message || 'Invalid OTP or Verification Failed' };
        }
        catch (error) {
            console.error('Aadhaar Verify Error:', error);
            return { success: false, message: 'Aadhaar verification service unavailable' };
        }
    }
    // ==========================================
    // PAYMENT GATEWAY
    // ==========================================
    async createOrder(orderId, amount, customerId, customerPhone) {
        try {
            const payload = {
                order_id: orderId,
                order_amount: amount,
                order_currency: 'INR',
                customer_details: {
                    customer_id: customerId,
                    customer_phone: customerPhone
                },
                order_meta: {
                    return_url: `https://example.com/payment-status?order_id=${orderId}`
                }
            };
            const response = await fetch(`${this.pgBaseUrl}/orders`, {
                method: 'POST',
                headers: this.pgHeaders,
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok && data.payment_session_id) {
                return { success: true, paymentSessionId: data.payment_session_id, orderId: data.order_id };
            }
            console.error('Cashfree Create Order Error:', data);
            return { success: false, message: data.message || 'Failed to create payment order' };
        }
        catch (error) {
            console.error('Cashfree Create Order Exception:', error);
            return { success: false, message: 'Payment gateway unavailable' };
        }
    }
    async getOrder(orderId) {
        try {
            const response = await fetch(`${this.pgBaseUrl}/orders/${orderId}`, {
                method: 'GET',
                headers: this.pgHeaders
            });
            const data = await response.json();
            if (response.ok) {
                return { success: true, status: data.order_status, data };
            }
            return { success: false, message: data.message || 'Failed to fetch order status' };
        }
        catch (error) {
            return { success: false, message: 'Payment gateway unavailable' };
        }
    }
    // Webhook Signature Verification
    verifyWebhookSignature(rawBody, signature, timestamp) {
        try {
            const signedPayload = timestamp + rawBody;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.pgSecretKey)
                .update(signedPayload)
                .digest('base64');
            return expectedSignature === signature;
        }
        catch (error) {
            return false;
        }
    }
}
exports.cashfreeService = new CashfreeService();
//# sourceMappingURL=cashfree.service.js.map