"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hptype_controller_1 = require("../controllers/hptype.controller");
const core_1 = require("../../core");
const validation_1 = require("../validation");
const hptypeRouter = (0, express_1.Router)();
hptypeRouter.post("/type", core_1.RequestValidator.validate(validation_1.hpTypeSchema), hptype_controller_1.default.createType);
exports.default = hptypeRouter;
//# sourceMappingURL=hptype.routes.js.map