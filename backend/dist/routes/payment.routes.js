"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// All payment routes require authentication
router.use(auth_middleware_1.authenticate);
router.post('/create-order', payment_controller_1.createPaymentOrder);
router.post('/verify', payment_controller_1.verifyPayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map