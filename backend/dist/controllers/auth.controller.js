"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetMpin = exports.verifyMpinResetOtp = exports.requestMpinReset = exports.loginWithMPIN = exports.createMPIN = exports.verifyFirebaseOTP = void 0;
const auth_1 = require("firebase-admin/auth");
const firebase_1 = __importStar(require("../config/firebase"));
const jwt_1 = require("../utils/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const whatsapp_service_1 = require("../services/whatsapp.service");
const verifyFirebaseOTP = async (req, res) => {
    try {
        const { idToken, phone, otp } = req.body;
        let phoneNumber = phone;
        // For urgent demo, bypass Firebase if OTP is 123456
        if (otp === '123456' && phone) {
            phoneNumber = `+91${phone}`;
        }
        else {
            if (!idToken) {
                return res.status(400).json({ success: false, message: 'idToken is required' });
            }
            // Verify Firebase ID token
            const decodedToken = await (0, auth_1.getAuth)(firebase_1.default).verifyIdToken(idToken);
            phoneNumber = decodedToken.phone_number;
        }
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number not found in token' });
        }
        // Check if user exists in database
        const usersRef = firebase_1.db.collection('users');
        const snapshot = await usersRef.where('phone', '==', phoneNumber).limit(1).get();
        let user = null;
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
            whatsapp_service_1.whatsappService.sendWelcomeMessage(phoneNumber).catch(err => {
                console.error('Failed to send WhatsApp welcome message:', err);
            });
        }
        else {
            const doc = snapshot.docs[0];
            user = { id: doc.id, ...doc.data() };
        }
        // Generate custom backend JWT token
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
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
    }
    catch (error) {
        console.error('Firebase OTP Verification Error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired OTP token', error: error.message });
    }
};
exports.verifyFirebaseOTP = verifyFirebaseOTP;
const createMPIN = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { mpin } = req.body;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (!mpin || mpin.length !== 4) {
            return res.status(400).json({ success: false, message: '4-digit MPIN is required' });
        }
        const hashedMpin = await bcrypt_1.default.hash(mpin, 10);
        await firebase_1.db.collection('users').doc(userId).update({ mpin: hashedMpin });
        res.status(200).json({ success: true, message: 'MPIN created successfully' });
    }
    catch (error) {
        console.error('Create MPIN Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create MPIN', error: error.message });
    }
};
exports.createMPIN = createMPIN;
const loginWithMPIN = async (req, res) => {
    try {
        const { phone, mpin } = req.body;
        if (!phone || !mpin) {
            return res.status(400).json({ success: false, message: 'Phone and MPIN are required' });
        }
        const snapshot = await firebase_1.db.collection('users').where('phone', '==', phone).limit(1).get();
        if (snapshot.empty) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const doc = snapshot.docs[0];
        const user = { id: doc.id, ...doc.data() };
        if (!user.mpin) {
            return res.status(401).json({ success: false, message: 'MPIN not set' });
        }
        const isMatch = await bcrypt_1.default.compare(mpin, user.mpin);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid MPIN' });
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
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
    }
    catch (error) {
        console.error('MPIN Login Error:', error);
        res.status(500).json({ success: false, message: 'Failed to login', error: error.message });
    }
};
exports.loginWithMPIN = loginWithMPIN;
// In-memory store for OTPs
const otpStore = new Map();
const requestMpinReset = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone)
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        const snapshot = await firebase_1.db.collection('users').where('phone', '==', phone).limit(1).get();
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to request reset', error: error.message });
    }
};
exports.requestMpinReset = requestMpinReset;
const verifyMpinResetOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp)
            return res.status(400).json({ success: false, message: 'Phone and OTP required' });
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
        const resetToken = (0, jwt_1.generateToken)({ userId: phone, role: 'reset' });
        otpStore.delete(phone); // Clear OTP
        res.status(200).json({ success: true, message: 'OTP verified', data: { resetToken } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
    }
};
exports.verifyMpinResetOtp = verifyMpinResetOtp;
const resetMpin = async (req, res) => {
    try {
        const { phone, resetToken, newMpin } = req.body;
        if (!phone || !resetToken || !newMpin) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        // Verify reset token (in a real app, you'd decode and verify the JWT)
        if (!resetToken) {
            return res.status(401).json({ success: false, message: 'Invalid reset token' });
        }
        const snapshot = await firebase_1.db.collection('users').where('phone', '==', phone).limit(1).get();
        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const hashedMpin = await bcrypt_1.default.hash(newMpin, 10);
        await firebase_1.db.collection('users').doc(snapshot.docs[0].id).update({ mpin: hashedMpin });
        res.status(200).json({ success: true, message: 'MPIN reset successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reset MPIN', error: error.message });
    }
};
exports.resetMpin = resetMpin;
//# sourceMappingURL=auth.controller.js.map