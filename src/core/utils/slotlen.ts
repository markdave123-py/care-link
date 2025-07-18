import { env } from "src/auth";

export function getSlotLen(): number{
    let slotlen = parseInt(env.SLOT_LENGTH_MINUTES, 10)

    if (Number.isNaN(slotlen) || slotlen <= 0){
        return 30
    }
    return slotlen
}