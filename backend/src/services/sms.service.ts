import axios from 'axios';

class SMSService {
  private async sendDLTMessage(phone: string, templateId: string, variables: Record<string, string>) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.FAST2SMS_SENDER_ID || 'NSMAHA';

    if (!apiKey) {
      console.log(`[SMS MOCK] (No API Key) To: ${phone}, Template: ${templateId}, Vars:`, variables);
      return;
    }

    // Clean phone number
    const cleanPhone = phone.replace('+91', '');
    if (cleanPhone === '9876543210') {
      console.log(`[SMS MOCK] (Demo Account) To: ${phone}, Template: ${templateId}, Vars:`, variables);
      return;
    }

    try {
      // Fast2SMS expects variables_values as a pipe separated string: "val1|val2"
      const valuesString = Object.values(variables).join('|');

      await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        params: {
          authorization: apiKey,
          route: 'dlt',
          sender_id: senderId,
          message: templateId,
          variables_values: valuesString,
          flash: 0,
          numbers: cleanPhone,
        }
      });
      console.log(`[SMS SUCCESS] Sent template ${templateId} to ${cleanPhone}`);
    } catch (error: any) {
      console.error('[SMS ERROR]', error?.response?.data || error.message);
    }
  }

  public async sendKycApproved(phone: string, name: string) {
    const templateId = process.env.TEMPLATE_ID_KYC_APPROVED;
    if (!templateId) return;
    await this.sendDLTMessage(phone, templateId, { name });
  }

  public async sendKycRejected(phone: string, name: string, reason: string) {
    const templateId = process.env.TEMPLATE_ID_KYC_REJECTED;
    if (!templateId) return;
    await this.sendDLTMessage(phone, templateId, { name, reason });
  }

  public async sendPaymentSuccess(phone: string, name: string, amount: string) {
    const templateId = process.env.TEMPLATE_ID_PAYMENT_SUCCESS;
    if (!templateId) return;
    await this.sendDLTMessage(phone, templateId, { name, amount });
  }

  public async sendPaymentFailed(phone: string, name: string, amount: string) {
    const templateId = process.env.TEMPLATE_ID_PAYMENT_FAILED;
    if (!templateId) return;
    await this.sendDLTMessage(phone, templateId, { name, amount });
  }

  public async sendSchemeJoined(phone: string, name: string, schemeName: string) {
    const templateId = process.env.TEMPLATE_ID_SCHEME_JOINED;
    if (!templateId) return;
    await this.sendDLTMessage(phone, templateId, { name, scheme: schemeName });
  }

  public async sendDigitalGold(phone: string, name: string, grams: string, balance: string) {
    const templateId = process.env.TEMPLATE_ID_DIGITAL_GOLD;
    if (!templateId) return;
    await this.sendDLTMessage(phone, templateId, { name, grams, balance });
  }

  public async sendDigitalSilver(phone: string, name: string, grams: string, balance: string) {
    const templateId = process.env.TEMPLATE_ID_DIGITAL_SILVER;
    if (!templateId) return;
    await this.sendDLTMessage(phone, templateId, { name, grams, balance });
  }

  public async sendLoginOtp(phone: string, otp: string) {
    const templateId = process.env.TEMPLATE_ID_APP_LOGIN;
    if (!templateId) {
      // Fallback to generic route
      const apiKey = process.env.FAST2SMS_API_KEY;
      if (!apiKey) return;
      
      const cleanPhone = phone.replace('+91', '');
      if (cleanPhone === '9876543210') return;

      try {
        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
          params: {
            authorization: apiKey,
            variables_values: otp,
            route: 'otp',
            numbers: cleanPhone,
          }
        });
      } catch (e: any) {
        console.error('[SMS ERROR]', e?.response?.data || e.message);
      }
      return;
    }
    
    await this.sendDLTMessage(phone, templateId, { otp });
  }

  public async sendMpinResetOtp(phone: string, otp: string) {
    const templateId = process.env.TEMPLATE_ID_MPIN_RESET;
    if (!templateId) {
      return this.sendLoginOtp(phone, otp);
    }
    await this.sendDLTMessage(phone, templateId, { otp });
  }

  public async sendAdminResetOtp(phone: string, otp: string) {
    const templateId = process.env.TEMPLATE_ID_ADMIN_RESET;
    if (!templateId) {
      return this.sendLoginOtp(phone, otp);
    }
    await this.sendDLTMessage(phone, templateId, { otp });
  }
}

export const smsService = new SMSService();
