import { Model } from 'sequelize';
export declare class WorkingHour extends Model {
    id: string;
    hp_id: string;
    dow: number;
    starts: string;
    ends: string;
}
