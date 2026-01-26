import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(
  OmitType(CreateAppointmentDto, ['userId'] as const)
) {
  @IsString()
  @IsOptional()
  cancelReason?: string;
}
