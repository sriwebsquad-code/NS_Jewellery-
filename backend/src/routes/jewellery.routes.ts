import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createCategory, getCategories, createJewelleryItem, getJewelleryItems, deleteCategory, deleteItem } from '../controllers/jewellery.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import { auditLog } from '../middlewares/audit.middleware';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer memory storage for Firebase Upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/categories', authenticate, authorizeAdmin, auditLog, upload.single('image'), createCategory);
router.get('/categories', getCategories);
router.delete('/categories/:id', authenticate, authorizeAdmin, auditLog, deleteCategory);

router.post('/items', authenticate, authorizeAdmin, auditLog, upload.single('image'), createJewelleryItem);
router.get('/items', getJewelleryItems);
router.delete('/items/:id', authenticate, authorizeAdmin, auditLog, deleteItem);

export default router;
