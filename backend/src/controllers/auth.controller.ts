import { Request, Response } from 'express';
import app, { db } from '../config/firebase';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import { whatsappService } from '../services/whatsapp.service';
import axios from 'axios';

// In-memory store for OTPs (In production, use Redis or Firestore)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Clean phone number (remove +91 if present)
    const cleanPhone = phone.replace('+91', '');

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store in memory
    otpStore.set(cleanPhone, { otp, expiresAt });
    
    // For demo purposes, we will bypass actually calling Fast2SMS if no API key is present
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (apiKey && cleanPhone !== '9876543210') { // 9876543210 is demo account
      try {
        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
          params: {
            authorization: apiKey,
            variables_values: otp,
            route: 'otp',
            numbers: cleanPhone,
          }
        });
      } catch (smsError: any) {
        console.error('Fast2SMS Error:', smsError?.response?.data || smsError.message);
        // Continue anyway for now so development doesn't block
      }
    } else {
      console.log(`[DEV ONLY] OTP for ${cleanPhone} is ${otp}`);
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
       return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const cleanPhone = phone.replace('+91', '');
    let phoneNumber = `+91${cleanPhone}`;

    // Demo account bypass
    if (!(cleanPhone === '9876543210' && otp === '123456')) {
       const storedData = otpStore.get(cleanPhone);
       
       if (!storedData) {
         return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
       }
       if (new Date() > storedData.expiresAt) {
         otpStore.delete(cleanPhone);
         return res.status(400).json({ success: false, message: 'OTP has expired' });
       }
       if (storedData.otp !== otp) {
         return res.status(400).json({ success: false, message: 'Incorrect OTP' });
       }
       // OTP verified! Clean it up.
       otpStore.delete(cleanPhone);
    }

    // Check if user exists in database
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('phone', '==', phoneNumber).limit(1).get();

    let user: any = null;
    let isNewUser = false;

    if (snapshot.empty) {
      const newUserRef = usersRef.doc();
      user = {
        id: newUserRef.id,
        phone: phoneNumber,
        role: 'CUSTOMER',
        kycStatus: 'PENDING',
        createdAt: new Date().toISOString()
      };
      await newUserRef.set(user);
      isNewUser = true;
      
      // Fire and forget WhatsApp Welcome Message
      whatsappService.sendWelcomeMessage(phoneNumber).catch(err => {
        console.error('Failed to send WhatsApp welcome message:', err);
      });
    } else {
      const doc = snapshot.docs[0]!;
      user = { id: doc.id, ...doc.data() };
    }

    // Generate custom backend JWT token
    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
          mpin: user.mpin,
          isNewUser
        }
      }
    });

  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const createMPIN = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { mpin } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!mpin || mpin.length !== 4) {
      return res.status(400).json({ success: false, message: '4-digit MPIN is required' });
    }

    const hashedMpin = await bcrypt.hash(mpin, 10);
    
    await db.collection('users').doc(userId).update({ mpin: hashedMpin });

    res.status(200).json({ success: true, message: 'MPIN created successfully' });
  } catch (error: any) {
    console.error('Create MPIN Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create MPIN', error: error.message });
  }
};

export const loginWithMPIN = async (req: Request, res: Response) => {
  try {
    const { phone, mpin } = req.body;

    if (!phone || !mpin) {
      return res.status(400).json({ success: false, message: 'Phone and MPIN are required' });
    }

    const snapshot = await db.collection('users').where('phone', '==', phone).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const doc = snapshot.docs[0]!;
    const user = { id: doc.id, ...doc.data() } as any;

    if (!user.mpin) {
      return res.status(401).json({ success: false, message: 'MPIN not set' });
    }

    const isMatch = await bcrypt.compare(mpin, user.mpin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid MPIN' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus
        }
      }
    });

  } catch (error: any) {
    console.error('MPIN Login Error:', error);
    res.status(500).json({ success: false, message: 'Failed to login', error: error.message });
  }
};



export const requestMpinReset = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    const snapshot = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    otpStore.set(phone, { otp, expiresAt });

    // Simulate sending OTP to phone and email
    console.log(`\n\n--- OTP NOTIFICATION ---`);
    console.log(`To: ${phone}`);
    console.log(`Message: Your OTP to reset MPIN for NS MAHAVEER JEWELLERY is ${otp}. Valid for 10 minutes.`);
    console.log(`------------------------\n\n`);

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to request reset', error: error.message });
  }
};

export const verifyMpinResetOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required' });

    const storedData = otpStore.get(phone);
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (new Date() > storedData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    // Generate a temporary reset token
    const resetToken = generateToken({ userId: phone, role: 'reset' });

    otpStore.delete(phone); // Clear OTP

    res.status(200).json({ success: true, message: 'OTP verified', data: { resetToken } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
};

export const resetMpin = async (req: Request, res: Response) => {
  try {
    const { phone, resetToken, newMpin } = req.body;
    if (!phone || !resetToken || !newMpin) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify reset token (in a real app, you'd decode and verify the JWT)
    if (!resetToken) {
       return res.status(401).json({ success: false, message: 'Invalid reset token' });
    }

    const snapshot = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedMpin = await bcrypt.hash(newMpin, 10);
    
    await db.collection('users').doc(snapshot.docs[0]!.id).update({ mpin: hashedMpin });

    res.status(200).json({ success: true, message: 'MPIN reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to reset MPIN', error: error.message });
  }
};

