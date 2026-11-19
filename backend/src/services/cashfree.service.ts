import crypto from 'crypto';

class CashfreeService {
  private pgAppId: string;
  private pgSecretKey: string;
  private verifyAppId: string;
  private verifySecretKey: string;
  private pgBaseUrl: string;
  private verifyBaseUrl: string;

  constructor() {
    this.pgAppId = (process.env.CASHFREE_APP_ID || '').trim();
    this.pgSecretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();
    
    // Support separate keys for Verification Suite, fallback to PG keys if not provided
    this.verifyAppId = (process.env.CASHFREE_VERIFY_APP_ID || this.pgAppId || '').trim();
    this.verifySecretKey = (process.env.CASHFREE_VERIFY_SECRET_KEY || this.pgSecretKey || '').trim();
    
    // Check if Sandbox vs Production
    const isPgProd = this.pgAppId && !this.pgSecretKey.toLowerCase().includes('test');
    const isVerifyProd = process.env.CASHFREE_VERIFY_ENV === 'PRODUCTION' || 
                         (this.verifyAppId && !this.verifySecretKey.toLowerCase().includes('test'));
    
    this.pgBaseUrl = isPgProd ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
    this.verifyBaseUrl = isVerifyProd ? 'https://api.cashfree.com/verification' : 'https://sandbox.cashfree.com/verification';
  }

  public getEnvironment() {
    return this.pgBaseUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION';
  }

  private get pgHeaders() {
    return {
      'x-client-id': this.pgAppId,
      'x-client-secret': this.pgSecretKey,
      'Content-Type': 'application/json',
      'x-api-version': '2022-09-01'
    };
  }

  private get verifyHeaders() {
    return {
      'x-client-id': this.verifyAppId,
      'x-client-secret': this.verifySecretKey,
      'Content-Type': 'application/json',
      'x-api-version': '2022-09-01'
    };
  }

  // ==========================================
  // IDENTITY VERIFICATION (KYC)
  // ==========================================

  async verifyPAN(panNumber: string, name: string) {
    // Bypass for testing purposes
    if (panNumber === 'ABCDE1234F' || panNumber === 'ABCDE1234A') {
      return { success: true, name: name || 'Test User', data: { valid: true } };
    }

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
    } catch (error: any) {
      console.error('PAN Verification Error:', error);
      return { success: false, message: 'Verification service unavailable' };
    }
  }

  async requestAadhaarOTP(aadhaarNumber: string) {
    // Bypass for demo and testing accounts
    if (aadhaarNumber === '123412341234' || aadhaarNumber === '999999999999' || aadhaarNumber === '000000000000') {
      return { success: true, ref_id: 'mock_aadhaar_ref_123456', message: 'OTP sent to registered mobile number (Demo Bypass)' };
    }

    try {
      console.log(`[CASHFREE KYC] Requesting Aadhaar OTP via ${this.verifyBaseUrl}. AppId: ${this.verifyAppId ? this.verifyAppId.slice(0, 8) + '...' : 'EMPTY'} (len: ${this.verifyAppId.length})`);
      const response = await fetch(`${this.verifyBaseUrl}/offline-aadhaar/otp`, {
        method: 'POST',
        headers: this.verifyHeaders,
        body: JSON.stringify({ aadhaar_number: aadhaarNumber })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, ref_id: data.ref_id, message: data.message };
      }
      console.error(`[CASHFREE KYC ERROR ${response.status}]`, data);
      return { success: false, message: data.message || 'Failed to send Aadhaar OTP' };
    } catch (error: any) {
      console.error('Aadhaar OTP Error:', error);
      return { success: false, message: 'Aadhaar OTP service unavailable' };
    }
  }

  async verifyAadhaarOTP(refId: string, otp: string) {
    // Bypass for demo and testing accounts
    if (refId === 'mock_aadhaar_ref_123456' && (otp === '123456' || otp === '1234')) {
      return { 
        success: true, 
        data: { 
          status: 'VALID',
          name: 'Parthiban',
          message: 'Aadhaar verified successfully (Demo Bypass)'
        } 
      };
    }

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
        }
      };

      const response = await fetch(`${this.pgBaseUrl}/orders`, {
        method: 'POST',
        headers: this.pgHeaders,
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok && data.payment_session_id) {
        return { 
          success: true, 
          paymentSessionId: data.payment_session_id, 
          orderId: data.order_id,
          environment: this.getEnvironment()
        };
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
        headers: this.pgHeaders
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
        .createHmac('sha256', this.pgSecretKey)
        .update(signedPayload)
        .digest('base64');
        
      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }
}

export const cashfreeService = new CashfreeService();
