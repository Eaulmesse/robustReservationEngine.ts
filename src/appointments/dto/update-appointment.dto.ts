import { AppointmentStatus } from '../../../generated/prisma';

export class UpdateAppointmentDto {
  userId?: string;
  providerId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
}
