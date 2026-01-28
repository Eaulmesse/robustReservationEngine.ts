import { AppointmentStatus } from '../../../generated/prisma';
import { IsDateString, IsString, IsOptional, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';

export class CreateAppointmentDto {

  
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  providerId: string;
  
  @IsDateString()
  @IsNotEmpty()
  startTime: string; 

  @IsDateString()
  @IsNotEmpty() 
  endTime: string; 
  @IsString()
  @IsOptional()
  notes?: string;
}
