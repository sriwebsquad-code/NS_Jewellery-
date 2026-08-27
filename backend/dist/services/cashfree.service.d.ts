declare class CashfreeService {
    private pgAppId;
    private pgSecretKey;
    private verifyAppId;
    private verifySecretKey;
    private pgBaseUrl;
    private verifyBaseUrl;
    constructor();
    private get pgHeaders();
    private get verifyHeaders();
    verifyPAN(panNumber: string, name: string): Promise<{
        success: boolean;
        name: any;
        data: any;
        message?: never;
    } | {
        name?: never;
        success: boolean;
        message: any;
        data: any;
    } | {
        name?: never;
        data?: never;
        success: boolean;
        message: string;
    }>;
    requestAadhaarOTP(aadhaarNumber: string): Promise<{
        success: boolean;
        ref_id: any;
        message: any;
    } | {
        ref_id?: never;
        success: boolean;
        message: any;
    }>;
    verifyAadhaarOTP(refId: string, otp: string): Promise<{
        message?: never;
        success: boolean;
        data: any;
    } | {
        data?: never;
        success: boolean;
        message: any;
    }>;
    createOrder(orderId: string, amount: number, customerId: string, customerPhone: string): Promise<{
        message?: never;
        success: boolean;
        paymentSessionId: any;
        orderId: any;
    } | {
        paymentSessionId?: never;
        orderId?: never;
        success: boolean;
        message: any;
    }>;
    getOrder(orderId: string): Promise<{
        message?: never;
        success: boolean;
        status: any;
        data: any;
    } | {
        data?: never;
        status?: never;
        success: boolean;
        message: any;
    }>;
    verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean;
}
export declare const cashfreeService: CashfreeService;
export {};
//# sourceMappingURL=cashfree.service.d.ts.map