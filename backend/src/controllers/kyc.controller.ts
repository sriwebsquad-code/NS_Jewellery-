import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { cashfreeService } from '../services/cashfree.service';

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { documentType, documentNumber } = req.body;
    
    if (!documentType || !documentNumber) {
      return res.status(400).json({ success: false, message: 'Document details required' });
    }

    let verificationResult;

    if (documentType.toUpperCase() === 'PAN') {
      // In a real app we'd get the actual user name from the DB to compare against
      const userDoc = await db.collection('users').doc(userId).get();
      const userName = userDoc.data()?.name || 'Customer';
      
      verificationResult = await cashfreeService.verifyPAN(documentNumber, userName);
    } else if (documentType.toUpperCase() === 'AADHAAR') {
      verificationResult = await cashfreeService.verifyAadhaar(documentNumber);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid document type. Must be PAN or AADHAAR.' });
    }

    if (!verificationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'KYC Verification Failed', 
        error: verificationResult.message 
      });
    }

    await db.collection('users').doc(userId).update({
      kycStatus: 'APPROVED',
      kycDocumentType: documentType,
      kycDocumentNumber: documentNumber,
      kycVerifiedAt: new Date().toISOString()
    });

    res.status(200).json({ 
      success: true, 
      message: 'KYC Submitted and Verified Successfully',
      details: (verificationResult as any).name ? `Verified Name: ${(verificationResult as any).name}` : undefined
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'KYC submission failed', error: error.message });
  }
};
