"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappService = void 0;
class WhatsAppService {
    token;
    phoneId;
    apiUrl;
    isConfigured;
    constructor() {
        this.token = process.env.WHATSAPP_TOKEN || '';
        this.phoneId = process.env.WHATSAPP_PHONE_ID || '';
        this.apiUrl = `https://graph.facebook.com/v17.0/${this.phoneId}/messages`;
        // Check if real credentials are provided
        this.isConfigured = !!this.token && !!this.phoneId;
    }
    /**
     * Sends a rich media welcome message using WhatsApp Cloud API Templates
     * @param toPhoneNumber The customer's phone number (with country code, no +)
     */
    async sendWelcomeMessage(toPhoneNumber) {
        try {
            // Strip any non-numeric characters from the phone number (e.g. +91 -> 91)
            const cleanPhone = toPhoneNumber.replace(/\D/g, '');
            const payload = {
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "template",
                template: {
                    name: "welcome_new_user", // The exact name of your approved template in Meta
                    language: {
                        code: "en"
                    },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "image",
                                    image: {
                                        // Replace this with a public URL of your application logo
                                        link: "https://example.com/ns_logo.jpg"
                                    }
                                }
                            ]
                        }
                        // The 3 buttons are defined in the Meta Template itself. 
                        // If they are static "Quick Reply" buttons, you don't need to pass parameters for them here.
                    ]
                }
            };
            if (!this.isConfigured) {
                // Development mode: Just log what would be sent
                console.log('=============================================');
                console.log('📱 [MOCK WHATSAPP] Sending Welcome Message');
                console.log(`To: +${cleanPhone}`);
                console.log('Template: welcome_new_user');
                console.log('Buttons included in template: [Go to Plan] [Digi Gold] [Digi Silver]');
                console.log('Payload:', JSON.stringify(payload, null, 2));
                console.log('=============================================');
                return true;
            }
            // Production mode: Actually call the Meta API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to send WhatsApp message');
            }
            console.log('WhatsApp message sent successfully:', data);
            return true;
        }
        catch (error) {
            console.error('Error sending WhatsApp message:', error.message);
            return false;
        }
    }
}
exports.whatsappService = new WhatsAppService();
//# sourceMappingURL=whatsapp.service.js.map