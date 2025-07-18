"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const response_utils_1 = require("../utils/response.utils");
const rag_service_1 = require("../../smart-sys/services/rag.service");
const ragService = new rag_service_1.default();
class HpTypeController {
}
_a = HpTypeController;
HpTypeController.createType = core_1.CatchAsync.wrap(async (req, res, next) => {
    const { profession } = req.body;
    const exists = await core_1.HPType.findOne({
        where: { name: profession }
    });
    if (exists) {
        return next(new core_1.AppError("Health practitioner Type already exists", 400));
    }
    const embedding = await ragService.getEmbedding(profession);
    const hptype = await core_1.HPType.create({
        name: profession,
        embedding
    });
    return response_utils_1.default.success(res, "Created a new hptype successfully", {
        id: hptype.id,
        name: hptype.name,
    });
});
HpTypeController.getAllTypes = core_1.CatchAsync.wrap(async (req, res, next) => {
    const allTypes = await core_1.HPType.findAll();
    if (!allTypes) {
        return next(new core_1.AppError("No Practitioner Type seen", 404));
    }
    return response_utils_1.default.success(res, "All Health Practitioner Types", [...allTypes]);
});
exports.default = HpTypeController;
//# sourceMappingURL=hptype.controller.js.map