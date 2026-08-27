"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public route to fetch settings (like WhatsApp number) for the mobile app
router.get('/', settings_controller_1.getSettings);
// Admin route to update settings
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, settings_controller_1.updateSettings);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map