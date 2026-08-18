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
router.get('/locker', digital_controller_1.getLocker);
router.post('/buy', digital_controller_1.buyDigitalCoin);
exports.default = router;
//# sourceMappingURL=digital.routes.js.map