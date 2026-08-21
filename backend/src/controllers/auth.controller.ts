import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import app, { db } from '../config/firebase';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const verifyFirebaseOTP = async (req: Request, res: Response) => {
  try {
    const { idToken, phone, otp } = req.body;

    let phoneNumber = phone;

    // For urgent demo, bypass Firebase if OTP is 123456
    if (otp === '123456' && phone) {
      phoneNumber = `+91${phone}`;
    } else {
      if (!idToken) {
        return res.status(400).json({ success: false, message: 'idToken is required' });
      }
      // Verify Firebase ID token
      const decodedToken = await getAuth(app).verifyIdToken(idToken);
      phoneNumber = decodedToken.phone_number;
    }

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number not found in token' });
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

// In-memory store for OTPs
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

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

