"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJewelleryItems = exports.createJewelleryItem = exports.getCategories = exports.createCategory = void 0;
const db_1 = __importDefault(require("../config/db"));
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        if (!name)
            return res.status(400).json({ success: false, message: 'Category name is required' });
        const category = await db_1.default.jewelleryCategory.create({
            data: {
                name,
                image: imagePath
            }
        });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        const categories = await db_1.default.jewelleryCategory.findMany();
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCategories = getCategories;
const createJewelleryItem = async (req, res) => {
    try {
        const { categoryId, name, purity, weight, description, makingCharges } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        if (!categoryId || !name || !purity || !weight) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const item = await db_1.default.jewelleryItem.create({
            data: {
                categoryId,
                name,
                purity,
                weight: parseFloat(weight),
                description: description || '',
                makingCharges: makingCharges ? parseFloat(makingCharges) : 0,
                images: imagePath ? [imagePath] : []
            }
        });
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createJewelleryItem = createJewelleryItem;
const getJewelleryItems = async (req, res) => {
    try {
        const items = await db_1.default.jewelleryItem.findMany({
            include: {
                category: true
            }
        });
        res.status(200).json({ success: true, data: items });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getJewelleryItems = getJewelleryItems;
//# sourceMappingURL=jewellery.controller.js.map