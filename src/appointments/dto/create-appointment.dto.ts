import { AppointmentStatus } from '../../../generated/prisma';
import { IsDateString, IsString, IsOptional, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  // userId est retiré du DTO - il viendra du JWT via @CurrentUser()
  
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  providerId: string;
  
  @IsDateString()
  @IsNotEmpty()
  startTime: string; // ISO date string (ex: "2026-01-27T10:00:00Z")

  @IsDateString()
  @IsNotEmpty() 
  endTime: string; // ISO date string
  
  @IsString()
  @IsOptional()
  notes?: string;
}
