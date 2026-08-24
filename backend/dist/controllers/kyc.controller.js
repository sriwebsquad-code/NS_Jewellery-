"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitKyc = void 0;
const firebase_1 = require("../config/firebase");
const cashfree_service_1 = require("../services/cashfree.service");
const submitKyc = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { documentType, documentNumber } = req.body;
        if (!documentType || !documentNumber) {
            return res.status(400).json({ success: false, message: 'Document details required' });
        }
        let verificationResult;
        if (documentType.toUpperCase() === 'PAN') {
            // In a real app we'd get the actual user name from the DB to compare against
            const userDoc = await firebase_1.db.collection('users').doc(userId).get();
            const userName = userDoc.data()?.name || 'Customer';
            verificationResult = await cashfree_service_1.cashfreeService.verifyPAN(documentNumber, userName);
        }
        else if (documentType.toUpperCase() === 'AADHAAR') {
            verificationResult = await cashfree_service_1.cashfreeService.verifyAadhaar(documentNumber);
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid document type. Must be PAN or AADHAAR.' });
        }
        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'KYC Verification Failed',
                error: verificationResult.message
            });
        }
        await firebase_1.db.collection('users').doc(userId).update({
            kycStatus: 'APPROVED',
            kycDocumentType: documentType,
            kycDocumentNumber: documentNumber,
            kycVerifiedAt: new Date().toISOString()
        });
        res.status(200).json({
            success: true,
            message: 'KYC Submitted and Verified Successfully',
            details: verificationResult.name ? `Verified Name: ${verificationResult.name}` : undefined
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'KYC submission failed', error: error.message });
    }
};
exports.submitKyc = submitKyc;
//# sourceMappingURL=kyc.controller.js.map