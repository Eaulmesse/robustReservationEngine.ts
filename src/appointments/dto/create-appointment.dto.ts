import { AppointmentStatus } from '../../../generated/prisma';
import { IsDate, IsString, IsOptional, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  providerId: string;
  
  @IsDate()
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @IsNotEmpty() 
  endTime: Date;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
  
  @IsString()
  @IsOptional()
  notes?: string;
}
