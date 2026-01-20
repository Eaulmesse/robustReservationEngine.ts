import { AppointmentStatus } from '../../../generated/prisma';

export class CreateAppointmentDto {
  userId: string;
  providerId: string;
  startTime: Date;
  endTime: Date;
  status?: AppointmentStatus;
  notes?: string;
}
