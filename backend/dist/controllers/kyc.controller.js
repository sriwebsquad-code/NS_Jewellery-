"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAadharOTP = exports.sendAadharOTP = void 0;
const db_1 = __importDefault(require("../config/db"));
// Mock sending OTP to Aadhar linked mobile number
const sendAadharOTP = async (req, res) => {
    try {
        const { aadharNumber } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (!aadharNumber || aadharNumber.length !== 12) {
            res.status(400).json({ success: false, message: 'Invalid Aadhar Number. Must be 12 digits.' });
            return;
        }
        // In a real implementation (e.g. Setu, Zoop, Cashfree), we would call their API here to trigger OTP.
        // For now, we mock the success response.
        res.json({
            success: true,
            message: 'OTP sent successfully to Aadhar linked mobile number',
            data: {
                referenceId: `mock-ref-${Date.now()}`,
            }
        });
    }
    catch (error) {
        console.error('Send Aadhar OTP Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};
exports.sendAadharOTP = sendAadharOTP;
// Mock verifying Aadhar OTP and updating KYC status
const verifyAadharOTP = async (req, res) => {
    try {
        const { aadharNumber, otp, referenceId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        if (!otp || otp.length !== 6) {
            res.status(400).json({ success: false, message: 'Invalid OTP. Must be 6 digits.' });
            return;
        }
        // Check if another user already has this Aadhar
        const existingAadhar = await db_1.default.user.findFirst({
            where: {
                aadharNumber,
                id: { not: userId }
            }
        });
        if (existingAadhar) {
            res.status(400).json({ success: false, message: 'This Aadhar number is already linked to another account' });
            return;
        }
        // In a real implementation, call the third-party API to verify the OTP using referenceId.
        // For the mock, any 6 digit OTP is considered valid.
        // Update user's KYC status
        const updatedUser = await db_1.default.user.update({
            where: { id: userId },
            data: {
                aadharNumber,
                kycStatus: 'VERIFIED'
            },
            select: {
                id: true,
                phone: true,
                name: true,
                aadharNumber: true,
                kycStatus: true
            }
        });
        res.json({
            success: true,
            message: 'Aadhar Verified Successfully!',
            data: updatedUser
        });
    }
    catch (error) {
        console.error('Verify Aadhar Error:', error);
        res.status(500).json({ success: false, message: 'Aadhar verification failed' });
    }
};
exports.verifyAadharOTP = verifyAadharOTP;
//# sourceMappingURL=kyc.controller.js.map