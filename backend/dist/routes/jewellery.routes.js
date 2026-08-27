"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const jewellery_controller_1 = require("../controllers/jewellery.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = (0, express_1.Router)();
// Ensure uploads directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Setup multer memory storage for Firebase Upload
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.post('/categories', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, audit_middleware_1.auditLog, upload.single('image'), jewellery_controller_1.createCategory);
router.get('/categories', jewellery_controller_1.getCategories);
router.delete('/categories/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, audit_middleware_1.auditLog, jewellery_controller_1.deleteCategory);
router.post('/items', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, audit_middleware_1.auditLog, upload.single('image'), jewellery_controller_1.createJewelleryItem);
router.get('/items', jewellery_controller_1.getJewelleryItems);
router.delete('/items/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, audit_middleware_1.auditLog, jewellery_controller_1.deleteItem);
exports.default = router;
//# sourceMappingURL=jewellery.routes.js.map