import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { cashfreeService } from '../services/cashfree.service';
import { smsService } from '../services/sms.service';

export const sendAadhaarOTP = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { aadharNumber } = req.body;
    if (!aadharNumber || aadharNumber.length !== 12) {
      return res.status(400).json({ success: false, message: 'Valid 12-digit Aadhaar number required' });
    }

    const result = await cashfreeService.requestAadhaarOTP(aadharNumber);
    if (result.success) {
      return res.status(200).json({ success: true, data: { referenceId: result.ref_id } });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
};

export const verifyAadhaarOTP = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { otp, referenceId, aadharNumber } = req.body;
    if (!otp || !referenceId) {
      return res.status(400).json({ success: false, message: 'OTP and referenceId required' });
    }

    const result = await cashfreeService.verifyAadhaarOTP(referenceId, otp);
    
    if (result.success) {
      // Mark user as KYC Verified
      await db.collection('users').doc(userId).update({
        kycStatus: 'VERIFIED',
        kycDocumentType: 'AADHAAR',
        kycDocumentNumber: aadharNumber,
        kycVerifiedAt: new Date().toISOString()
      });

      // Send SMS
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      if (userData?.phone) {
        await smsService.sendKycApproved(userData.phone, userData.name || 'Customer');
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Aadhaar Verified Successfully',
        data: result.data
      });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
};

export const verifyPAN = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { panNumber } = req.body;
    
    if (!panNumber || panNumber.length !== 10) {
      return res.status(400).json({ success: false, message: 'Valid PAN number required' });
    }

    // Get the actual user name from the DB to compare against
    const userDoc = await db.collection('users').doc(userId).get();
    const userName = userDoc.data()?.name || 'Customer';
    
    const verificationResult = await cashfreeService.verifyPAN(panNumber, userName);

    if (!verificationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'PAN Verification Failed', 
        error: verificationResult.message 
      });
    }

    await db.collection('users').doc(userId).update({
      kycStatus: 'VERIFIED',
      kycDocumentType: 'PAN',
      kycDocumentNumber: panNumber,
      kycVerifiedAt: new Date().toISOString()
    });

    // Send SMS
    const userData = userDoc.data();
    if (userData?.phone) {
      await smsService.sendKycApproved(userData.phone, verificationResult.name || userName);
    }

    res.status(200).json({ 
      success: true, 
      message: 'PAN Verified Successfully',
      details: verificationResult.name ? `Verified Name: ${verificationResult.name}` : undefined
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'PAN verification failed', error: error.message });
  }
};
