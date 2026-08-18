import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const doc = await db.collection('users').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = doc.data() as any;
    // Don't send mpin back
    delete userData.mpin;

    res.status(200).json({ success: true, data: { id: doc.id, ...userData } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, email, address, city, state, pincode, dob, gender } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (address) dataToUpdate.address = address;
    if (city) dataToUpdate.city = city;
    if (state) dataToUpdate.state = state;
    if (pincode) dataToUpdate.pincode = pincode;
    if (dob) dataToUpdate.dob = dob;
    if (gender) dataToUpdate.gender = gender;

    await db.collection('users').doc(userId).update(dataToUpdate);

    const updatedDoc = await db.collection('users').doc(userId).get();
    const userData = updatedDoc.data() as any;
    delete userData.mpin;

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: { id: updatedDoc.id, ...userData } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      delete data.mpin; // Don't send passwords
      return {
        id: doc.id,
        ...data
      };
    });

    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};
