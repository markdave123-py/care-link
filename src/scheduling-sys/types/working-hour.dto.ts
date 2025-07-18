export interface WorkingHourDTO {
    /** Day‑of‑week, 0 = Monday -- 6 = Sunday */
    dow: number;
  
    /** Shift start in 24‑h HH:mm, aligned to slot grid */
    start: string;
  
    /** Shift end in 24‑h HH:mm, strictly > start */
    end: string;
  }
  