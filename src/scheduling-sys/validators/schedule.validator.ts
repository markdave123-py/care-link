import { WorkingHourDTO } from '../types/working-hour.dto';
import { getSlotLen }     from 'src/core';
import  dayjs              from 'dayjs';
import { AppError }       from 'src/core';

export function normaliseSchedule(raw: any[]): WorkingHourDTO[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new AppError('schedule must be a non‑empty array', 400);
  }

  const grid = getSlotLen();   // 30 is the default
  // Map<dow, Array<[startMin,endMin]>>
  const buckets = new Map<number, [number, number][]>();

  // validate and build bucket 
  for (const { dow, start, end } of raw) {
    if (dow < 0 || dow > 6) throw new AppError(`dow ${dow} out of range`, 400);

    const s = dayjs(`1970-01-01T${start}:00Z`);
    const e = dayjs(`1970-01-01T${end}:00Z`);
    if (!s.isValid() || !e.isValid() || !s.isBefore(e))
      throw new AppError(`bad time range ${start}–${end}`, 400);

    if (s.minute() % grid || e.minute() % grid)
      throw new AppError(`times must align to ${grid}-min grid`, 400);

    const sMin = s.hour() * 60 + s.minute();
    const eMin = e.hour() * 60 + e.minute(); // exclusive bound

    (buckets.get(dow) ?? []).push([sMin, eMin]);
    buckets.set(dow, buckets.get(dow)!);
  }

  // merge per day 
  const result: WorkingHourDTO[] = [];

  for (const [dow, ints] of buckets) {
    // sort by start
    ints.sort((a, b) => a[0] - b[0]);

    let [curS, curE] = ints[0];
    for (let i = 1; i < ints.length; i++) {
      const [s, e] = ints[i];
      if (s <= curE) {
        // overlap or touch then extend
        curE = Math.max(curE, e);
      } else {
        // push current, start new
        result.push({ dow, start: minToStr(curS), end: minToStr(curE) });
        [curS, curE] = [s, e];
      }
    }
    // push last interval
    result.push({ dow, start: minToStr(curS), end: minToStr(curE) });
  }

  return result;
}

function minToStr(total: number): string {
  const h = Math.floor(total / 60).toString().padStart(2, '0');
  const m = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
