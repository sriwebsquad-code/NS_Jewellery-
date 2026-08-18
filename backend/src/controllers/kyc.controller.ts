import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { documentType, documentNumber } = req.body;
    
    if (!documentType || !documentNumber) {
      return res.status(400).json({ success: false, message: 'Document details required' });
    }

    await db.collection('users').doc(userId).update({
      kycStatus: 'APPROVED',
      kycDocumentType: documentType,
      kycDocumentNumber: documentNumber
    });

    res.status(200).json({ success: true, message: 'KYC Submitted and Approved' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'KYC submission failed', error: error.message });
  }
};
