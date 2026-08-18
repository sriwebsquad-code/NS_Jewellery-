import { Request, Response } from 'express';
import prisma from '../config/db';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const category = await prisma.jewelleryCategory.create({
      data: {
        name,
        image: imagePath
      }
    });

    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.jewelleryCategory.findMany();
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJewelleryItem = async (req: Request, res: Response) => {
  try {
    const { categoryId, name, purity, weight, description, makingCharges, stock, basePrice } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!categoryId || !name || !purity || !weight) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const item = await prisma.jewelleryItem.create({
      data: {
        categoryId,
        name,
        purity,
        weight: parseFloat(weight),
        description: description || '',
        makingCharges: makingCharges ? parseFloat(makingCharges) : 0,
        stock: stock ? parseInt(stock) : 0,
        basePrice: basePrice ? parseFloat(basePrice) : null,
        images: imagePath ? [imagePath] : []
      }
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJewelleryItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.jewelleryItem.findMany({
      include: {
        category: true
      }
    });
    res.status(200).json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
