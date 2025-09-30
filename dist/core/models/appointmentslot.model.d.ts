import { Model } from 'sequelize';
export declare class AppointmentSlot extends Model {
    id: string;
    hp_id: string;
    patient_id: string;
    request_session_id: string | null;
    session_id: string | null;
    start_ts: Date;
    end_ts: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}
