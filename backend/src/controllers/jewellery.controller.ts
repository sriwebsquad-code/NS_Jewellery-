import { Request, Response } from 'express';
import { db, storage } from '../config/firebase';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    let imagePath = null;

    if (req.file) {
      const fileName = `categories/${Date.now()}-${req.file.originalname}`;
      const fileUpload = storage.file(fileName);
      
      await fileUpload.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        public: true
      });
      
      imagePath = `https://storage.googleapis.com/${storage.name}/${fileName}`;
    }

    const docRef = db.collection('jewelleryCategories').doc();
    const category = {
      id: docRef.id,
      name,
      image: imagePath,
      createdAt: new Date().toISOString()
    };
    
    await docRef.set(category);

    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    console.error('Create Category Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('jewelleryCategories').orderBy('createdAt', 'desc').get();
    const categories = snapshot.docs.map(doc => doc.data());
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

export const createJewelleryItem = async (req: Request, res: Response) => {
  try {
    const { categoryId, name, purity, weight, description, makingCharges, stock, basePrice } = req.body;
    
    if (!categoryId || !name || !purity || !weight) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    let imagePath = null;

    if (req.file) {
      const fileName = `items/${Date.now()}-${req.file.originalname}`;
      const fileUpload = storage.file(fileName);
      
      await fileUpload.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        public: true
      });
      
      imagePath = `https://storage.googleapis.com/${storage.name}/${fileName}`;
    }

    const docRef = db.collection('jewelleryItems').doc();
    const item = {
      id: docRef.id,
      categoryId,
      name,
      purity,
      weight: parseFloat(weight),
      description: description || '',
      makingCharges: makingCharges ? parseFloat(makingCharges) : 0,
      stock: stock ? parseInt(stock) : 0,
      basePrice: basePrice ? parseFloat(basePrice) : null,
      images: imagePath ? [imagePath] : [],
      createdAt: new Date().toISOString()
    };

    await docRef.set(item);

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    console.error('Create Item Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create item', error: error.message });
  }
};

export const getJewelleryItems = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('jewelleryItems').orderBy('createdAt', 'desc').get();
    
    // Fetch categories to manually join
    const categoriesSnap = await db.collection('jewelleryCategories').get();
    const categoryMap: any = {};
    categoriesSnap.docs.forEach(doc => {
      categoryMap[doc.id] = doc.data();
    });

    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        category: categoryMap[data.categoryId] || null
      };
    });

    res.status(200).json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch items', error: error.message });
  }
};
