/**
 * WhatsApp Cloud API Integration Service
 *
 * INSTRUCTIONS FOR PRODUCTION:
 * 1. Go to https://developers.facebook.com/
 * 2. Create an App (Type: Business) and set up the WhatsApp product.
 * 3. Generate a Permanent Access Token.
 * 4. Go to WhatsApp > Message Templates in your Facebook Business Manager.
 * 5. Create a template named "welcome_new_user" with:
 *    - Header: Image
 *    - Body: "Welcome to NS Mahaveer Jewellery! ✨ We are thrilled to have you. Explore our latest collections and exclusive offers today."
 *    - Buttons: 3 Quick Reply buttons: "Go to Plan", "Digi Gold", "Digi Silver"
 * 6. Set the environment variables in your backend .env file:
 *    WHATSAPP_TOKEN="your_access_token_here"
 *    WHATSAPP_PHONE_ID="your_phone_number_id"
 */
declare class WhatsAppService {
    private token;
    private phoneId;
    private apiUrl;
    private isConfigured;
    constructor();
    /**
     * Sends a rich media welcome message using WhatsApp Cloud API Templates
     * @param toPhoneNumber The customer's phone number (with country code, no +)
     */
    sendWelcomeMessage(toPhoneNumber: string): Promise<boolean>;
}
export declare const whatsappService: WhatsAppService;
export {};
//# sourceMappingURL=whatsapp.service.d.ts.map