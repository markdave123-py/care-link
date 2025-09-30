import { Op } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

import { AppError, HealthPractitioner, WorkingHour, AppointmentSlot } from '../../core';
import { getSlotLen } from '../../auth';

type SlotDTO = {
  start_ts: string;     // ISO UTC
  end_ts:   string;     // ISO UTC
  start_local: string;  // "HH:mm" in HP tz
  end_local:   string;  // "HH:mm" in HP tz
};

type DayAvailability = {
  date_local: string;       // "YYYY-MM-DD" in HP tz
  slots: SlotDTO[];
};

export async function getHpAvailabilityService(params: {
  hpId: string;
  from?: string;           // "YYYY-MM-DD" (local to HP) optional
  to?: string;             // "YYYY-MM-DD" (local to HP) optional
  days?: number;           // alternative to `to`: length window
  includePast?: boolean;   // default false: hide slots before now
}) { 
  const { hpId } = params;
  const hp = await HealthPractitioner.findByPk(hpId);
  if (!hp) throw new AppError('Health practitioner not found', 404);

  // Get hp timezone if exist else default to Africa/Lagos
  const hpTZ: string = (hp as any).timezone || 'Africa/Lagos';
  const SLOT_MIN = getSlotLen();

  // Resolve range in HP local time (default: next 14 days)
  const nowLocal = dayjs().tz(hpTZ);
  const startLocal = params.from
    ? dayjs.tz(params.from, 'YYYY-MM-DD', hpTZ).startOf('day')
    : nowLocal.startOf('day');
  const endLocal = params.to
    ? dayjs.tz(params.to, 'YYYY-MM-DD', hpTZ).endOf('day')
    : startLocal.add(params.days ?? 14, 'day').endOf('day');

  if (!startLocal.isValid() || !endLocal.isValid() || !startLocal.isBefore(endLocal)) {
    throw new AppError('Invalid date range', 400);
  }
  // protect server
  if (endLocal.diff(startLocal, 'day') > 90) {
    throw new AppError('Range too large (max 90 days)', 400);
  }

  // Load weekly template once
  const weekly = await WorkingHour.findAll({
    where: { hp_id: hpId },
    attributes: ['dow', 'starts', 'ends'],
    order: [['dow', 'ASC'], ['starts', 'ASC']],
  });

  // Quick map: dow(0=Mon..6=Sun) -> blocks
  const byDow = new Map<number, { starts: string; ends: string }[]>();
  for (const row of weekly) {
    const item = { starts: (row as any).starts as string, ends: (row as any).ends as string };
    const dow: number = (row as any).dow;
    const arr = byDow.get(dow) ?? [];
    arr.push(item);
    byDow.set(dow, arr);
  }

  // Pull busy intervals (UTC) that overlap the entire window
  const windowStartUTC = startLocal.utc().toDate();
  const windowEndUTC   = endLocal.utc().toDate();

  const busy = await AppointmentSlot.findAll({
    where: {
      hp_id: hpId,
      status: { [Op.in]: ['pending', 'accepted'] },
      start_ts: { [Op.lt]: windowEndUTC },
      end_ts:   { [Op.gt]: windowStartUTC },
    },
    attributes: ['start_ts', 'end_ts'],
    order: [['start_ts', 'ASC']],
  });

  // Normalize busy into numeric intervals for quick overlap checks
  const busyRanges: Array<[number, number]> = busy.map((b: any) => [
    new Date(b.start_ts).getTime(),
    new Date(b.end_ts).getTime(),
  ]);

  const results: DayAvailability[] = [];
  // Helper to map JS Sunday=0..Saturday=6 into your scheme Monday=0..Sunday=6
  const mondayZero = (d: dayjs.Dayjs) => (d.day() + 6) % 7; // day(): Sun=0, Mon=1 -> 0..6 with Mon=0

  // Iterate each day
  for (let d = startLocal.startOf('day'); d.isBefore(endLocal); d = d.add(1, 'day')) {
    const dow = mondayZero(d);
    const blocks = byDow.get(dow) ?? [];
    const daySlots: SlotDTO[] = [];

    for (const { starts, ends } of blocks) {
      // Build local block start/end for this calendar date
      // `starts` likely "HH:mm:ss" or "HH:mm"
      const [sh, sm] = starts.split(':').map(Number);
      const [eh, em] = ends.split(':').map(Number);
      let curLocal = d.tz(hpTZ).hour(sh).minute(sm).second(0).millisecond(0);
      const endLocalBlock = d.tz(hpTZ).hour(eh).minute(em).second(0).millisecond(0);

      // Step by slot length
      while (curLocal.add(SLOT_MIN, 'minute').isSameOrBefore(endLocalBlock)) {
        const nextLocal = curLocal.add(SLOT_MIN, 'minute');

        // Optional: hide past
        if (params.includePast !== true) {
          if (nextLocal.isBefore(nowLocal)) {
            curLocal = nextLocal;
            continue;
          }
        }

        // Convert to UTC and test overlap
        const sUTCms = curLocal.utc().valueOf();
        const eUTCms = nextLocal.utc().valueOf();

        const overlaps = busyRanges.some(([bs, be]) => sUTCms < be && eUTCms > bs);
        if (!overlaps) {
          daySlots.push({
            start_ts: new Date(sUTCms).toISOString(),
            end_ts:   new Date(eUTCms).toISOString(),
            start_local: curLocal.format('HH:mm'),
            end_local:   nextLocal.format('HH:mm'),
          });
        }

        curLocal = nextLocal;
      }
    }

    results.push({ date_local: d.format('YYYY-MM-DD'), slots: daySlots });
  }

  return {
    hp_id: hpId,
    timezone: hpTZ,
    slot_length_minutes: SLOT_MIN,
    from_local: startLocal.format('YYYY-MM-DD'),
    to_local: endLocal.format('YYYY-MM-DD'),
    days: results,
  };
}
