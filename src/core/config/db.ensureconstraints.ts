import sequelize from '../config/db';
import { getSlotLen } from '../../auth';


const SLOT_LEN = getSlotLen();

export async function ensureConstraints() {
  await sequelize.query(`CREATE EXTENSION IF NOT EXISTS btree_gist;`);

  // drop and recreate the check every time
  await sequelize.query(`
    ALTER TABLE "AppointmentSlots"
    DROP CONSTRAINT IF EXISTS chk_fixed_length;
  `);

  await sequelize.query(`
    ALTER TABLE "AppointmentSlots"
    ADD  CONSTRAINT chk_fixed_length
    CHECK ( "end_ts" = "start_ts" + interval '${SLOT_LEN} minutes' );
  `);

  // exclusion constraint stays untouched — it doesn’t contain SLOT_LEN
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'appointment_no_overlap'
      ) THEN
        ALTER TABLE "AppointmentSlots"
          ADD CONSTRAINT appointment_no_overlap
          EXCLUDE USING GIST (
            "hp_id" WITH =,
            tstzrange("start_ts", "end_ts") WITH &&
          )
          WHERE ("status" IN ('pending','accepted'));
      END IF;
    END$$;
  `);
}