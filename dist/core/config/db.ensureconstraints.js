"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureConstraints = ensureConstraints;
const db_1 = require("../config/db");
const auth_1 = require("../../auth");
const SLOT_LEN = (0, auth_1.getSlotLen)();
async function ensureConstraints() {
    await db_1.default.query(`CREATE EXTENSION IF NOT EXISTS btree_gist;`);
    await db_1.default.query(`
    ALTER TABLE "AppointmentSlots"
    DROP CONSTRAINT IF EXISTS chk_fixed_length;
  `);
    await db_1.default.query(`
    ALTER TABLE "AppointmentSlots"
    ADD  CONSTRAINT chk_fixed_length
    CHECK ( "end_ts" = "start_ts" + interval '${SLOT_LEN} minutes' );
  `);
    await db_1.default.query(`
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
//# sourceMappingURL=db.ensureconstraints.js.map