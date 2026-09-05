import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { cashfreeService } from '../services/cashfree.service';
import { smsService } from '../services/sms.service';

// Helper to match names securely
const isNameMatch = (name1: string, name2: string): boolean => {
  if (!name1 || !name2) return false;
  const n1 = name1.toLowerCase().trim().split(/[\s,.-]+/).filter(Boolean);
  const n2 = name2.toLowerCase().trim().split(/[\s,.-]+/).filter(Boolean);
  
  // At least one significant name token (>2 chars) must match exactly to prevent false positives
  return n1.some(word => word.length > 2 && n2.includes(word));
};

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
      // Name Matching check
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const aadhaarName = result.data?.name || '';
      
      if (userData?.name && !isNameMatch(userData.name, aadhaarName)) {
        return res.status(400).json({ 
          success: false, 
          message: `Identity mismatch. Aadhaar name (${aadhaarName}) does not match registered profile name.` 
        });
      }

      // Mark user as KYC Verified (Aadhar)
      await db.collection('users').doc(userId).update({
        kycStatus: 'VERIFIED',
        kycDocumentType: 'AADHAAR',
        aadharNumber: aadharNumber,
        kycVerifiedAt: new Date().toISOString()
      });

      // Send SMS
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
        message: verificationResult.message || 'PAN Verification Failed', 
        error: verificationResult.message 
      });
    }

    // Name Matching Check (Cashfree PAN service returns name match boolean or actual name)
    const panName = verificationResult.name || verificationResult.data?.registered_name || '';
    if (userName !== 'Customer' && panName && !isNameMatch(userName, panName)) {
      return res.status(400).json({ 
        success: false, 
        message: `Identity mismatch. PAN name (${panName}) does not match registered profile name.` 
      });
    }

    // Mark user as PAN Verified
    await db.collection('users').doc(userId).update({
      panStatus: 'VERIFIED',
      panNumber: panNumber,
      panVerifiedAt: new Date().toISOString()
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
