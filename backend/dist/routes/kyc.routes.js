"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kyc_controller_1 = require("../controllers/kyc.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/aadhar/send-otp', auth_middleware_1.authenticate, kyc_controller_1.sendAadharOTP);
router.post('/aadhar/verify', auth_middleware_1.authenticate, kyc_controller_1.verifyAadharOTP);
exports.default = router;
//# sourceMappingURL=kyc.routes.js.map