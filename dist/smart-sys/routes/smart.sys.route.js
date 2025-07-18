"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const rag_service_1 = require("../services/rag.service");
exports.SmartRouter = (0, express_1.Router)();
const ragService = new rag_service_1.default();
const smartSys = new controllers_1.SmartSys(ragService);
exports.SmartRouter.post("/hp-by-symptom", smartSys.getHpBySymptom);
//# sourceMappingURL=smart.sys.route.js.map