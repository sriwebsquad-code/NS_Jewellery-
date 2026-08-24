declare class CashfreeService {
    private appId;
    private secretKey;
    private pgBaseUrl;
    private verifyBaseUrl;
    constructor();
    private get headers();
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
    verifyAadhaar(aadhaarNumber: string): Promise<{
        success: boolean;
        message: string;
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