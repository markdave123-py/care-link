"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartSys = void 0;
const core_1 = require("../../core");
class SmartSys {
    constructor(rag) {
        this.rag = rag;
        this.getHpBySymptom = core_1.CatchAsync.wrap(async (req, res, next) => {
            const { symptom } = req.body;
            if (!symptom || typeof symptom !== 'string' || symptom.trim().length < 3) {
                return next(new core_1.AppError("Invalid symptoms!", core_1.HttpStatus.BAD_REQUEST));
            }
            const healthPractitioners = await this.rag.getHPsbySymptom(symptom);
            if (healthPractitioners.length === 0) {
                return next(new core_1.AppError("No health practitioner for this symptom", core_1.HttpStatus.NOT_FOUND));
            }
            return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Health Pratitioners sucessfully retrieved", healthPractitioners);
        });
    }
}
exports.SmartSys = SmartSys;
//# sourceMappingURL=smart.sys.js.map