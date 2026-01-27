import { DayOfWeek } from "generated/prisma/client";

// src/utils/date.utils.ts
export function getDayOfWeekFromDate(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
}