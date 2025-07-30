import { AppError, CatchAsync, HealthPractitioner, HttpStatus, responseHandler, sequelize, WorkingHour } from "../../core";
import type { Response, NextFunction } from "express";
import { AuthenticateRequest } from "src/auth/middlewares";
import { normaliseSchedule } from "../validators/schedule.validator";
import type { WorkingHourDTO } from "../types";


export class HpSchedule{

    static getSchedule = CatchAsync.wrap(async (req:AuthenticateRequest, res: Response) => {
        const { hp_id } = req.params;

        const workingHours = await WorkingHour.findAll({
            where: {hp_id: hp_id},
            attributes: ['dow', 'starts', 'ends'],
            order: [['dow', 'ASC'], ['starts', 'ASC']]
        });
        return responseHandler.success(res, HttpStatus.OK, "working hours retrived", workingHours);
    })

    static upsertSchedule = CatchAsync.wrap(async (req:AuthenticateRequest, res: Response, next: NextFunction) =>{
        const blocks = req.body?.schedule;
        let schedule: WorkingHourDTO[];

        try {
            schedule = normaliseSchedule(blocks)
        } catch (error) {
            return next(error)
        }

        const hpId = req.userId;
        const hp = await HealthPractitioner.findByPk(hpId);
        if (!hp){
            return next(new AppError('health practitioner not found', HttpStatus.NOT_FOUND));
        }

        const tnx = await sequelize.transaction();
        try {
            // destroy existing working schedule to make transaction idempotent
            await WorkingHour.destroy({where: {hp_id: hpId}, transaction: tnx})

            await WorkingHour.bulkCreate(
                schedule.map(({dow, start, end}) =>({
                    hp_id: hpId,
                    dow,
                    starts: start,
                    ends: end,
                })),
                {transaction: tnx}
            );

            await tnx.commit();
        } catch (error) {
            await tnx.rollback();
            return next(error);
        }

        return responseHandler.success(
            res,
            HttpStatus.OK,
            "Working hours saved",
            schedule
        );
    });
}