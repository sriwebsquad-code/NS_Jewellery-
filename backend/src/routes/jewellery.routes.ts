import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createCategory, getCategories, createJewelleryItem, getJewelleryItems } from '../controllers/jewellery.controller';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/categories', upload.single('image'), createCategory);
router.get('/categories', getCategories);

router.post('/items', upload.single('image'), createJewelleryItem);
router.get('/items', getJewelleryItems);

export default router;
