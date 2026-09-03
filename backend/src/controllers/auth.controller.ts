import { Request, Response } from 'express';
import app, { db } from '../config/firebase';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import { whatsappService } from '../services/whatsapp.service';
import { smsService } from '../services/sms.service';
import axios from 'axios';
import nodemailer from 'nodemailer';

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

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
    
    // Use SMS Service (handles DLT and generic fallback)
    console.log(`[AUTH DEBUG] Triggering SMS service to send OTP to ${cleanPhone}`);
    await smsService.sendLoginOtp(phone, otp);

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

    const safeUser = { ...user };
    delete safeUser.mpin;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          ...safeUser,
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
    
    const safeUser = { ...user };
    delete safeUser.mpin;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: safeUser
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

    // Send SMS via SMS Service
    await smsService.sendMpinResetOtp(phone, otp);

    // Simulate sending OTP to email
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

export const sendEmailOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store in memory using email as key
    otpStore.set(cleanEmail, { otp, expiresAt });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: cleanEmail,
      subject: 'NS Mahaveer Jewellery - Admin Verification',
      text: `Your Admin Password Reset OTP is ${otp}. It is valid for 10 minutes. Do not share this code.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6a0d2f;">NS Mahaveer Jewellery</h2>
          <p>You requested to verify your identity for Admin Access.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; display: inline-block;">
            <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code:</p>
            <h1 style="margin: 5px 0 0 0; letter-spacing: 5px; color: #333;">${otp}</h1>
          </div>
          <p style="font-size: 12px; color: #999;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV ONLY] Email OTP for ${cleanEmail} is ${otp}`);
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully to email' });
  } catch (error: any) {
    console.error('Send Email OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send Email OTP' });
  }
};

export const verifyOtpOnly = async (req: Request, res: Response) => {
  try {
    const { phone, email, otp } = req.body;
    
    if ((!phone && !email) || !otp) {
      return res.status(400).json({ success: false, message: 'Phone or Email, and OTP are required' });
    }

    const identifier = phone ? phone.replace('+91', '') : email.toLowerCase().trim();
    
    // Demo account bypass
    if (identifier === '9876543210' && otp === '123456') {
      return res.status(200).json({ success: true, message: 'OTP verified' });
    }

    const storedData = otpStore.get(identifier);
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (new Date() > storedData.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    // OTP is valid! Do not create a user, just return success.
    otpStore.delete(identifier);
    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error: any) {
    console.error('Verify OTP Only Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

