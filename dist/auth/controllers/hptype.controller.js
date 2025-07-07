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
HpTypeController.createType = core_1.CatchAsync.wrap(async (req, res) => {
    const { profession } = req.body;
    const embedding = await ragService.getEmbedding(profession);
    const hptype = await core_1.HPType.create({
        name: profession,
        embedding
    });
    return response_utils_1.default.success(res, {
        id: hptype.id,
        name: hptype.name,
    }, "Created a new hptype successfully");
});
exports.default = HpTypeController;
//# sourceMappingURL=hptype.controller.js.map