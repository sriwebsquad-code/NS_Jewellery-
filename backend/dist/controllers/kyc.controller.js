"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPAN = exports.verifyAadhaarOTP = exports.sendAadhaarOTP = void 0;
const firebase_1 = require("../config/firebase");
const cashfree_service_1 = require("../services/cashfree.service");
const sendAadhaarOTP = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { aadharNumber } = req.body;
        if (!aadharNumber || aadharNumber.length !== 12) {
            return res.status(400).json({ success: false, message: 'Valid 12-digit Aadhaar number required' });
        }
        const result = await cashfree_service_1.cashfreeService.requestAadhaarOTP(aadharNumber);
        if (result.success) {
            return res.status(200).json({ success: true, data: { referenceId: result.ref_id } });
        }
        else {
            return res.status(400).json({ success: false, message: result.message });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
};
exports.sendAadhaarOTP = sendAadhaarOTP;
const verifyAadhaarOTP = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { otp, referenceId, aadharNumber } = req.body;
        if (!otp || !referenceId) {
            return res.status(400).json({ success: false, message: 'OTP and referenceId required' });
        }
        const result = await cashfree_service_1.cashfreeService.verifyAadhaarOTP(referenceId, otp);
        if (result.success) {
            // Mark user as KYC Verified
            await firebase_1.db.collection('users').doc(userId).update({
                kycStatus: 'VERIFIED',
                kycDocumentType: 'AADHAAR',
                kycDocumentNumber: aadharNumber,
                kycVerifiedAt: new Date().toISOString()
            });
            return res.status(200).json({
                success: true,
                message: 'Aadhaar Verified Successfully',
                data: result.data
            });
        }
        else {
            return res.status(400).json({ success: false, message: result.message });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
    }
};
exports.verifyAadhaarOTP = verifyAadhaarOTP;
const verifyPAN = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { panNumber } = req.body;
        if (!panNumber || panNumber.length !== 10) {
            return res.status(400).json({ success: false, message: 'Valid PAN number required' });
        }
        // Get the actual user name from the DB to compare against
        const userDoc = await firebase_1.db.collection('users').doc(userId).get();
        const userName = userDoc.data()?.name || 'Customer';
        const verificationResult = await cashfree_service_1.cashfreeService.verifyPAN(panNumber, userName);
        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'PAN Verification Failed',
                error: verificationResult.message
            });
        }
        await firebase_1.db.collection('users').doc(userId).update({
            kycStatus: 'VERIFIED',
            kycDocumentType: 'PAN',
            kycDocumentNumber: panNumber,
            kycVerifiedAt: new Date().toISOString()
        });
        res.status(200).json({
            success: true,
            message: 'PAN Verified Successfully',
            details: verificationResult.name ? `Verified Name: ${verificationResult.name}` : undefined
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'PAN verification failed', error: error.message });
    }
};
exports.verifyPAN = verifyPAN;
//# sourceMappingURL=kyc.controller.js.map