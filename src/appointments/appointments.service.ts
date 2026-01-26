import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus, DayOfWeek } from '../../generated/prisma';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, userId: string) {
    // Convertir les strings ISO en Date
    const startTime = new Date(createAppointmentDto.startTime);
    const endTime = new Date(createAppointmentDto.endTime);
    
    // Validation basique
    if (endTime <= startTime) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    const appointmentData = {
      userId,
      providerId: createAppointmentDto.providerId,
      startTime,
      endTime,
      notes: createAppointmentDto.notes,
      status: AppointmentStatus.PENDING,
    };

    // Vérifier si le créneau est disponible
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        providerId: appointmentData.providerId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('Ce créneau est déjà réservé');
    }

    return this.prisma.appointment.create({
      data: appointmentData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            description: true,
            address: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            description: true,
            address: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            description: true,
            address: true,
          },
        },
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            description: true,
            address: true,
          },
        },
      },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.appointment.findMany({
      where: { providerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            description: true,
            address: true,
          },
        },
      },
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    await this.findOne(id);

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            description: true,
            address: true,
          },
        },
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            description: true,
            address: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async findAvailableByDate(date: string, providerId: string) {
    const availableSlots = await this.prisma.availability.findMany({
      where: { providerId, dayOfWeek: DayOfWeek.MONDAY },
    });
    return availableSlots;
  }
}
