"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HpSchedule = void 0;
const core_1 = require("../../core");
const schedule_validator_1 = require("../validators/schedule.validator");
class HpSchedule {
}
exports.HpSchedule = HpSchedule;
_a = HpSchedule;
HpSchedule.getSchedule = core_1.CatchAsync.wrap(async (req, res) => {
    const { hp_id } = req.params;
    const workingHours = await core_1.WorkingHour.findAll({
        where: { hp_id: hp_id },
        attributes: ['dow', 'starts', 'ends'],
        order: [['dow', 'ASC'], ['starts', 'ASC']]
    });
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "working hours retrived", workingHours);
});
HpSchedule.upsertSchedule = core_1.CatchAsync.wrap(async (req, res, next) => {
    var _b;
    const blocks = (_b = req.body) === null || _b === void 0 ? void 0 : _b.schedule;
    let schedule;
    try {
        schedule = (0, schedule_validator_1.normaliseSchedule)(blocks);
    }
    catch (error) {
        return next(error);
    }
    const hpId = req.userId;
    const hp = await core_1.HealthPractitioner.findByPk(hpId);
    if (!hp) {
        return next(new core_1.AppError('health practitioner not found', core_1.HttpStatus.NOT_FOUND));
    }
    const tnx = await core_1.sequelize.transaction();
    try {
        await core_1.WorkingHour.destroy({ where: { hp_id: hpId }, transaction: tnx });
        await core_1.WorkingHour.bulkCreate(schedule.map(({ dow, start, end }) => ({
            hp_id: hpId,
            dow,
            starts: start,
            ends: end,
        })), { transaction: tnx });
        await tnx.commit();
    }
    catch (error) {
        await tnx.rollback();
        return next(error);
    }
    return core_1.responseHandler.success(res, core_1.HttpStatus.OK, "Working hours saved", schedule);
});
//# sourceMappingURL=hp.schedule.js.map