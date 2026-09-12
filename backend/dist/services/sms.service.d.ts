declare class SMSService {
    private sendDLTMessage;
    sendKycApproved(phone: string, name: string): Promise<void>;
    sendKycRejected(phone: string, name: string, reason: string): Promise<void>;
    sendPaymentSuccess(phone: string, name: string, amount: string): Promise<void>;
    sendPaymentFailed(phone: string, name: string, amount: string): Promise<void>;
    sendSchemeJoined(phone: string, name: string, schemeName: string): Promise<void>;
    sendDigitalGold(phone: string, name: string, grams: string, balance: string): Promise<void>;
    sendDigitalSilver(phone: string, name: string, grams: string, balance: string): Promise<void>;
    sendLoginOtp(phone: string, otp: string): Promise<void>;
    sendMpinResetOtp(phone: string, otp: string): Promise<void>;
    sendMetalRedeemed(phone: string, name: string, metalType: string, weight: string, balance: string): Promise<void>;
    sendSchemeRedeemed(phone: string, name: string, schemeName: string): Promise<void>;
    sendPaymentRatePending(phone: string, name: string): Promise<void>;
    sendPaymentFinalized(phone: string, name: string, amount: string, rate: string, grams: string): Promise<void>;
}
export declare const smsService: SMSService;
export {};
//# sourceMappingURL=sms.service.d.ts.map