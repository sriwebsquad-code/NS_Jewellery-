"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const digital_controller_1 = require("../controllers/digital.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate); // Require authentication for all routes
router.get('/balance', digital_controller_1.getBalance);
router.get('/locker', digital_controller_1.getLockerDashboard);
router.get('/transactions', digital_controller_1.getTransactions);
router.post('/transactions', digital_controller_1.createTransaction);
// Admin routes
router.get('/admin/users', auth_middleware_1.authorizeAdmin, digital_controller_1.getDigitalUsers);
router.get('/admin/user/:userId/transactions/:metalType', auth_middleware_1.authorizeAdmin, digital_controller_1.getUserMetalTransactions);
router.post('/admin/user/:userId/redeem/:metalType', auth_middleware_1.authorizeAdmin, digital_controller_1.redeemUserMetal);
exports.default = router;
//# sourceMappingURL=digital.routes.js.map