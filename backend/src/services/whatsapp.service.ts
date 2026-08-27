import axios from 'axios';

/**
 * Fast2SMS WhatsApp API Integration Service
 * 
 * INSTRUCTIONS FOR PRODUCTION:
 * 1. Log in to your Fast2SMS Dashboard.
 * 2. Go to the WhatsApp section and configure your Welcome Template.
 * 3. Make sure you use the FAST2SMS_API_KEY environment variable.
 */

class WhatsAppService {
  private apiKey: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY || '';
    this.isConfigured = !!this.apiKey;
  }

  /**
   * Sends a welcome message using Fast2SMS WhatsApp API
   * @param toPhoneNumber The customer's phone number
   */
  async sendWelcomeMessage(toPhoneNumber: string) {
    try {
      // Strip any non-numeric characters from the phone number
      const cleanPhone = toPhoneNumber.replace(/\D/g, '');
      
      // Remove country code if it exists for Fast2SMS (often expects 10 digits)
      const tenDigitPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;

      if (!this.isConfigured) {
        // Development mode
        console.log('=============================================');
        console.log('📱 [MOCK FAST2SMS WHATSAPP] Sending Welcome Message');
        console.log(`To: ${tenDigitPhone}`);
        console.log('Template: Welcome Template');
        console.log('=============================================');
        return true;
      }

      // Production mode: Call Fast2SMS
      // Note: Adjust the params based on your exact Fast2SMS WhatsApp template configuration
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'whatsapp', // Fast2SMS WhatsApp route
          numbers: tenDigitPhone,
          message: 'Welcome to NS Mahaveer Jewellery! ✨ Explore our latest collections and exclusive offers today.',
        },
        {
          headers: {
            'authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp message sent via Fast2SMS:', response.data);
      return true;
    } catch (error: any) {
      console.error('Error sending Fast2SMS WhatsApp message:', error?.response?.data || error.message);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
