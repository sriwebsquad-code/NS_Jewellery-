"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Endpoint for Firebase phone authentication login
router.post('/verify-otp', auth_controller_1.verifyFirebaseOTP);
// MPIN Routes
router.post('/mpin/create', auth_middleware_1.authenticate, auth_controller_1.createMPIN);
router.post('/mpin/login', auth_controller_1.loginWithMPIN);
router.post('/mpin/request-reset', auth_controller_1.requestMpinReset);
router.post('/mpin/reset', auth_controller_1.resetMpin);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map