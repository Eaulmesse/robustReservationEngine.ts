import { DayOfWeek } from '../../../generated/prisma';

export class CreateAvailabilityDto {
  providerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isRecurring?: boolean;
  specificDate?: Date;
  isActive?: boolean;
}
