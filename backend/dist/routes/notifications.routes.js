"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notifications_controller_1 = require("../controllers/notifications.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate);
router.get('/', notifications_controller_1.getNotifications);
router.patch('/:notificationId/read', notifications_controller_1.markAsRead);
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map