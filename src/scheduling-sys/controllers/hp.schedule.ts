import { AppError, CatchAsync, HealthPractitioner, HttpStatus, responseHandler, sequelize, WorkingHour } from "../../core";
import type { Response, NextFunction } from "express";
import type { AuthenticateRequest } from "src/auth/middlewares";
import { normaliseSchedule } from "../validators/schedule.validator";
import type { WorkingHourDTO } from "../types";
import { getHpAvailabilityService } from "../services/availability.service";


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

    /**
      * GET /hp/:hp_id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD&days=14&includePast=false
      * Returns discrete availability slots (30 minutes by default) in HP's local tz.
    */
    static getAvailability = async (req: AuthenticateRequest, res: Response) => {
        const { hp_id } = req.params;
        const { from, to, days, includePast } = req.query as {
        from?: string;
        to?: string;
        days?: string;
        includePast?: string;
        };

        // call your already-implemented service
        const data = await getHpAvailabilityService({
        hpId: hp_id,
        from,
        to,
        days: days ? Number(days) : undefined,
        includePast: includePast === "true",
        });

        return responseHandler.success(
        res,
        HttpStatus.OK,
        "Availability generated",
        data
        );
    };
}