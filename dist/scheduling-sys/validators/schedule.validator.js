"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normaliseSchedule = normaliseSchedule;
const dayjs = require("dayjs");
const core_1 = require("../../core");
const auth_1 = require("../../auth");
function normaliseSchedule(raw) {
    if (!Array.isArray(raw) || raw.length === 0) {
        throw new core_1.AppError('schedule must be a non‑empty array', 400);
    }
    const grid = (0, auth_1.getSlotLen)();
    const buckets = new Map();
    for (const { dow, start, end } of raw) {
        if (dow < 0 || dow > 6)
            throw new core_1.AppError(`dow ${dow} out of range`, 400);
        const s = dayjs(`1970-01-01T${start}:00Z`);
        const e = dayjs(`1970-01-01T${end}:00Z`);
        if (!s.isValid() || !e.isValid() || !s.isBefore(e))
            throw new core_1.AppError(`bad time range ${start}–${end}`, 400);
        if (s.minute() % grid || e.minute() % grid)
            throw new core_1.AppError(`times must align to ${grid}-min grid`, 400);
        const sMin = s.hour() * 60 + s.minute();
        const eMin = e.hour() * 60 + e.minute();
        let arr = buckets.get(dow);
        if (!arr) {
            arr = [];
            buckets.set(dow, arr);
        }
        arr.push([sMin, eMin]);
    }
    const result = [];
    for (const [dow, ints] of buckets) {
        ints.sort((a, b) => a[0] - b[0]);
        let [curS, curE] = ints[0];
        for (let i = 1; i < ints.length; i++) {
            const [s, e] = ints[i];
            if (s <= curE) {
                curE = Math.max(curE, e);
            }
            else {
                result.push({ dow, start: minToStr(curS), end: minToStr(curE) });
                [curS, curE] = [s, e];
            }
        }
        result.push({ dow, start: minToStr(curS), end: minToStr(curE) });
    }
    return result;
}
function minToStr(total) {
    const h = Math.floor(total / 60).toString().padStart(2, '0');
    const m = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}
//# sourceMappingURL=schedule.validator.js.map