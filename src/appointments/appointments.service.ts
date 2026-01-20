import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../../generated/prisma';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    // Vérifier si le créneau est disponible
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        providerId: createAppointmentDto.providerId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: createAppointmentDto.startTime } },
              { endTime: { gt: createAppointmentDto.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: createAppointmentDto.endTime } },
              { endTime: { gte: createAppointmentDto.endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('Ce créneau est déjà réservé');
    }

    return this.prisma.appointment.create({
      data: createAppointmentDto,
      include: {
        user: true,
        provider: true,
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        user: true,
        provider: true,
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
        provider: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findByUser(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      include: {
        user: true,
        provider: true,
      },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.appointment.findMany({
      where: { providerId },
      include: {
        user: true,
        provider: true,
      },
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    await this.findOne(id);

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        user: true,
        provider: true,
      },
    });
  }

  async cancel(id: string, cancelReason: string) {
    await this.findOne(id);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelReason,
      },
      include: {
        user: true,
        provider: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
