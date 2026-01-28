import { DayOfWeek } from '../../../generated/prisma';
import { IsString, IsNotEmpty, IsEnum, IsDate, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';  

export class CreateAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  providerId: string;

  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;
  
  @IsString()
  @IsNotEmpty()
  startTime: string;
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  slotDuration: number;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean = true;

  @IsDate()
  @IsOptional()
  specificDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
