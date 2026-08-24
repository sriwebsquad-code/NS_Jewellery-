"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashfreeService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CashfreeService {
    appId;
    secretKey;
    pgBaseUrl;
    verifyBaseUrl;
    constructor() {
        this.appId = process.env.CASHFREE_APP_ID || 'CF11189547DA4JAQ1K4BVC73FG3BNG';
        this.secretKey = process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_test_63c2bc850aecb14af9c979f445e05e62_e4503c4e';
        // Always use Sandbox/Test environment for now
        this.pgBaseUrl = 'https://sandbox.cashfree.com/pg';
        this.verifyBaseUrl = 'https://sandbox.cashfree.com/verification';
    }
    get headers() {
        return {
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
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
                headers: this.headers,
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
    async verifyAadhaar(aadhaarNumber) {
        // Note: Aadhaar verification usually requires an OTP flow (Generate OTP -> Verify OTP).
        // For Sandbox/Simulated flows, Cashfree provides specific test endpoints.
        // We simulate a direct verification check for demo purposes here.
        try {
            // In a real flow, you first call /aadhaar/otp, then /aadhaar/verify
            // For sandbox without an OTP entered by user, we'll mock a success if length is 12
            if (aadhaarNumber.length === 12) {
                return { success: true, message: 'Aadhaar Verified (Sandbox Mock)' };
            }
            return { success: false, message: 'Invalid Aadhaar Number' };
        }
        catch (error) {
            return { success: false, message: 'Aadhaar verification failed' };
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
                headers: this.headers,
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
                headers: this.headers
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
                .createHmac('sha256', this.secretKey)
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