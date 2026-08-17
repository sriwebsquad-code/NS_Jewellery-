import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import app from '../config/firebase';
import prisma from '../config/db';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const verifyFirebaseOTP = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await getAuth(app).verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number not found in token' });
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { phone: phoneNumber }
    });

    // If user does not exist, create a new one
    let isNewUser = false;
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: phoneNumber,
          role: 'CUSTOMER'
        }
      });
      isNewUser = true;
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
          isNewUser
        }
      }
    });

  } catch (error: any) {
    console.error('Firebase OTP Verification Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired OTP token', error: error.message });
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
    
    await prisma.user.update({
      where: { id: userId },
      data: { mpin: hashedMpin }
    });

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

    const user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user || !user.mpin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or MPIN not set' });
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
          role: user.role
        }
      }
    });

  } catch (error: any) {
    console.error('MPIN Login Error:', error);
    res.status(500).json({ success: false, message: 'Failed to login', error: error.message });
  }
};

// In-memory store for OTPs (since DB server is currently down)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export const requestMpinReset = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    otpStore.set(phone, { otp, expiresAt });

    // Simulate sending OTP to phone and email
    console.log(`\n\n--- OTP NOTIFICATION ---`);
    console.log(`Sending OTP to Mobile (${phone}): ${otp}`);
    if (user.email) {
      console.log(`Sending OTP to Email (${user.email}): ${otp}`);
    } else {
      console.log(`No email registered for ${phone}. Sent to mobile only.`);
    }
    console.log(`------------------------\n\n`);

    res.status(200).json({ 
      success: true, 
      message: user.email ? 'OTP sent to mobile number and email' : 'OTP sent to mobile number',
      data: { otp } // Included in response for easy testing
    });
  } catch (error: any) {
    console.error('Request MPIN Reset Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
};

export const resetMpin = async (req: Request, res: Response) => {
  try {
    const { phone, otp, newMpin } = req.body;
    
    if (!phone || !otp || !newMpin || newMpin.length !== 4) {
      return res.status(400).json({ success: false, message: 'Phone, OTP, and 4-digit new MPIN are required' });
    }

    const storedData = otpStore.get(phone);
    if (!storedData) {
      return res.status(400).json({ success: false, message: 'No OTP requested or OTP expired' });
    }

    if (storedData.expiresAt < new Date()) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is valid, hash new MPIN and save
    const hashedMpin = await bcrypt.hash(newMpin, 10);
    await prisma.user.update({
      where: { phone },
      data: { mpin: hashedMpin }
    });

    // Clear OTP after successful reset
    otpStore.delete(phone);

    res.status(200).json({ success: true, message: 'MPIN has been successfully reset' });
  } catch (error: any) {
    console.error('Reset MPIN Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset MPIN', error: error.message });
  }
};

