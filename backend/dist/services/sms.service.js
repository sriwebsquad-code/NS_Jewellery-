"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = void 0;
const axios_1 = __importDefault(require("axios"));
class SMSService {
    async sendDLTMessage(phone, templateId, variables) {
        const apiKey = process.env.FAST2SMS_API_KEY;
        const senderId = process.env.FAST2SMS_SENDER_ID || 'NSMJCU';
        if (!apiKey) {
            console.error(`[SMS ERROR] Missing FAST2SMS_API_KEY in environment variables. OTP/Message was not sent to ${phone}!`);
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
            await axios_1.default.get('https://www.fast2sms.com/dev/bulkV2', {
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
        }
        catch (error) {
            console.error('[SMS ERROR]', error?.response?.data || error.message);
        }
    }
    async sendKycApproved(phone, name) {
        const templateId = process.env.TEMPLATE_ID_KYC_APPROVED;
        if (!templateId)
            return;
        await this.sendDLTMessage(phone, templateId, { name });
    }
    async sendKycRejected(phone, name, reason) {
        const templateId = process.env.TEMPLATE_ID_KYC_REJECTED;
        if (!templateId)
            return;
        await this.sendDLTMessage(phone, templateId, { name, reason });
    }
    async sendPaymentSuccess(phone, name, amount) {
        const templateId = process.env.TEMPLATE_ID_PAYMENT_SUCCESS;
        if (!templateId)
            return;
        await this.sendDLTMessage(phone, templateId, { name, amount });
    }
    async sendPaymentFailed(phone, name, amount) {
        const templateId = process.env.TEMPLATE_ID_PAYMENT_FAILED;
        if (!templateId)
            return;
        await this.sendDLTMessage(phone, templateId, { name, amount });
    }
    async sendSchemeJoined(phone, name, schemeName) {
        const templateId = process.env.TEMPLATE_ID_SCHEME_JOINED;
        if (!templateId)
            return;
        await this.sendDLTMessage(phone, templateId, { name, scheme: schemeName });
    }
    async sendDigitalGold(phone, name, grams, balance) {
        const templateId = process.env.TEMPLATE_ID_DIGITAL_GOLD;
        if (!templateId)
            return;
        await this.sendDLTMessage(phone, templateId, { name, grams, balance });
    }
    async sendDigitalSilver(phone, name, grams, balance) {
        const templateId = process.env.TEMPLATE_ID_DIGITAL_SILVER;
        if (!templateId)
            return;
        await this.sendDLTMessage(phone, templateId, { name, grams, balance });
    }
    async sendLoginOtp(phone, otp) {
        const templateId = process.env.TEMPLATE_ID_APP_LOGIN;
        if (!templateId) {
            // Fallback to generic route
            const apiKey = process.env.FAST2SMS_API_KEY;
            if (!apiKey) {
                console.error(`[SMS ERROR] Missing FAST2SMS_API_KEY in environment variables. OTP was not sent to ${phone}!`);
                return;
            }
            const cleanPhone = phone.replace('+91', '');
            if (cleanPhone === '9876543210')
                return;
            try {
                console.log(`[SMS DEBUG] Sending Fast2SMS OTP to ${cleanPhone} via POST /dev/otp/send`);
                const response = await axios_1.default.post('https://www.fast2sms.com/dev/otp/send', {
                    mobile: cleanPhone,
                    otp: otp
                }, {
                    headers: {
                        'authorization': apiKey,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`[SMS SUCCESS] Fast2SMS OTP API Response (Request ID: ${response.data?.request_id || 'N/A'}):`, JSON.stringify(response.data));
            }
            catch (e) {
                console.error('[SMS ERROR] Fast2SMS OTP API Failed:', e?.response?.data || e.message);
            }
            return;
        }
        await this.sendDLTMessage(phone, templateId, { otp });
    }
    async sendMpinResetOtp(phone, otp) {
        const templateId = process.env.TEMPLATE_ID_MPIN_RESET;
        if (!templateId) {
            return this.sendLoginOtp(phone, otp);
        }
        await this.sendDLTMessage(phone, templateId, { otp });
    }
}
exports.smsService = new SMSService();
//# sourceMappingURL=sms.service.js.map