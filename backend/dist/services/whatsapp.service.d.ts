/**
 * Fast2SMS WhatsApp API Integration Service
 *
 * INSTRUCTIONS FOR PRODUCTION:
 * 1. Log in to your Fast2SMS Dashboard.
 * 2. Go to the WhatsApp section and configure your Welcome Template.
 * 3. Make sure you use the FAST2SMS_API_KEY environment variable.
 */
declare class WhatsAppService {
    private apiKey;
    private isConfigured;
    constructor();
    /**
     * Sends a welcome message using Fast2SMS WhatsApp API
     * @param toPhoneNumber The customer's phone number
     */
    sendWelcomeMessage(toPhoneNumber: string): Promise<boolean>;
}
export declare const whatsappService: WhatsAppService;
export {};
//# sourceMappingURL=whatsapp.service.d.ts.map