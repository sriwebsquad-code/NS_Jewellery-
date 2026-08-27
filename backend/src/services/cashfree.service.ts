import crypto from 'crypto';

class CashfreeService {
  private appId: string;
  private secretKey: string;
  private pgBaseUrl: string;
  private verifyBaseUrl: string;

  constructor() {
    this.appId = process.env.CASHFREE_APP_ID || '';
    this.secretKey = process.env.CASHFREE_SECRET_KEY || '';
    
    // Automatically switch between Sandbox and Production based on Render environment
    const isProd = process.env.NODE_ENV === 'production';
    
    this.pgBaseUrl = isProd ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
    this.verifyBaseUrl = isProd ? 'https://api.cashfree.com/verification' : 'https://sandbox.cashfree.com/verification';
  }

  private get headers() {
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

  async verifyPAN(panNumber: string, name: string) {
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
    } catch (error: any) {
      console.error('PAN Verification Error:', error);
      return { success: false, message: 'Verification service unavailable' };
    }
  }

  async requestAadhaarOTP(aadhaarNumber: string) {
    try {
      const response = await fetch(`${this.verifyBaseUrl}/offline-aadhaar/otp`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ aadhaar_number: aadhaarNumber })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, ref_id: data.ref_id, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to send Aadhaar OTP' };
    } catch (error: any) {
      console.error('Aadhaar OTP Error:', error);
      return { success: false, message: 'Aadhaar OTP service unavailable' };
    }
  }

  async verifyAadhaarOTP(refId: string, otp: string) {
    try {
      const response = await fetch(`${this.verifyBaseUrl}/offline-aadhaar/verify`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ ref_id: refId, otp })
      });
      const data = await response.json();
      if (response.ok && data.status === 'VALID') {
         return { success: true, data };
      }
      return { success: false, message: data.message || 'Invalid OTP or Verification Failed' };
    } catch (error: any) {
      console.error('Aadhaar Verify Error:', error);
      return { success: false, message: 'Aadhaar verification service unavailable' };
    }
  }


  // ==========================================
  // PAYMENT GATEWAY
  // ==========================================

  async createOrder(orderId: string, amount: number, customerId: string, customerPhone: string) {
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
    } catch (error: any) {
      console.error('Cashfree Create Order Exception:', error);
      return { success: false, message: 'Payment gateway unavailable' };
    }
  }

  async getOrder(orderId: string) {
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
    } catch (error: any) {
      return { success: false, message: 'Payment gateway unavailable' };
    }
  }

  // Webhook Signature Verification
  verifyWebhookSignature(rawBody: string, signature: string, timestamp: string) {
    try {
      const signedPayload = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(signedPayload)
        .digest('base64');
        
      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }
}

export const cashfreeService = new CashfreeService();
