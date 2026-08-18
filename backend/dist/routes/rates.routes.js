"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rates_controller_1 = require("../controllers/rates.controller");
const router = (0, express_1.Router)();
router.get('/', rates_controller_1.getRates);
router.post('/', rates_controller_1.updateRates);
exports.default = router;
//# sourceMappingURL=rates.routes.js.map