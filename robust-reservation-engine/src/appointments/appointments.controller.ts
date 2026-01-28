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
  ForbiddenException,
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
    // userId vient du token JWT, pas du body
    return this.appointmentsService.create(createAppointmentDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('providerId') providerId?: string) {
    // Les admins voient tout
    if (user.role === UserRole.ADMIN) {
      if (providerId) {
        return this.appointmentsService.findByProvider(providerId);
      }
      return this.appointmentsService.findAll();
    }
    
    // Les clients voient leurs RDV (en tant que client ET provider)
    return this.appointmentsService.findByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const appointment = await this.appointmentsService.findOne(id);
    
    // Vérifier que l'utilisateur a le droit de voir ce RDV
    if (
      user.role !== UserRole.ADMIN &&
      appointment.userId !== user.id &&
      appointment.providerId !== user.id
    ) {
      throw new ForbiddenException('Accès non autorisé à ce rendez-vous');
    }
    
    return appointment;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @CurrentUser() user: any,
  ) {
    const appointment = await this.appointmentsService.findOne(id);
    
    // Seuls les admins et le provider peuvent modifier
    if (
      user.role !== UserRole.ADMIN &&
      appointment.providerId !== user.id
    ) {
      throw new ForbiddenException('Seul le provider ou un admin peut modifier ce RDV');
    }
    
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('cancelReason') cancelReason: string,
    @CurrentUser() user: any,
  ) {
    const appointment = await this.appointmentsService.findOne(id);
    
    // Le client, le provider ou un admin peuvent annuler
    if (
      user.role !== UserRole.ADMIN &&
      appointment.userId !== user.id &&
      appointment.providerId !== user.id
    ) {
      throw new ForbiddenException('Vous ne pouvez pas annuler ce rendez-vous');
    }
    
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
