import { Request, Response } from 'express';
import prisma from '../config/db';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, email, address, city, state, pincode } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, address, city, state, pincode },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        role: true,
      }
    });

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};
