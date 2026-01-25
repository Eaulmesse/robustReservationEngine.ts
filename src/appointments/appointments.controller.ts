import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,

} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../../generated/prisma';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user: any) {
    return this.appointmentsService.create(createAppointmentDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('userId') userId?: string,
    @Query('providerId') providerId?: string,
  ) {
    if (userId) {
      return this.appointmentsService.findByUser(userId);
    }
    if (providerId) {
      return this.appointmentsService.findByProvider(providerId);
    }
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('cancelReason') cancelReason: string) {
    return this.appointmentsService.cancel(id, cancelReason);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Get('available/:date')
  findAvailable(@Param('date') date: string, @Query('providerId') providerId: string) {
    return this.appointmentsService.findAvailableByDate(date, providerId);
  }
}
