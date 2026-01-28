import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus, DayOfWeek } from '../../generated/prisma';
import { getDayOfWeekFromDate } from 'src/utils/date.utils';
import { GoogleService } from '../google/google.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private googleService: GoogleService,
  ) {}

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

    return await this.prisma.$transaction(async (tx) => {
      // Vérification des conflits avec verrouillage pessimiste
      const conflicting = await tx.$queryRaw`
        SELECT * FROM appointments 
        WHERE "providerId" = ${appointmentData.providerId}
        AND status IN ('PENDING', 'CONFIRMED')
        AND (
          ("startTime" <= ${startTime} AND "endTime" > ${startTime})
          OR ("startTime" < ${endTime} AND "endTime" >= ${endTime})
        )
        FOR UPDATE
      `;
      if((conflicting as { id: string }[]).length > 0) {
        throw new BadRequestException('Ce créneau est déjà réservé');
      }

      // Récupérer les infos du provider pour Google Meet
      const provider = await tx.user.findUnique({
        where: { id: appointmentData.providerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          googleAccessToken: true,
        },
      });

      const client = await tx.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      // Préparer les données Google Meet (optionnel)
      let googleMeetData: {
        meetingLink?: string;
        googleEventId?: string;
        googleCalendarId?: string;
      } = {};

      // Si le provider a un token Google, créer un événement Meet
      if (provider?.googleAccessToken) {
        try {
          const meetEvent = await this.googleService.createMeetEvent(
            provider.googleAccessToken,
            {
              startTime,
              endTime,
              summary: `Rendez-vous avec ${client?.firstName} ${client?.lastName}`,
              description: createAppointmentDto.notes || 'Rendez-vous confirmé',
              attendeeEmail: client?.email,
            },
          );

          googleMeetData = {
            meetingLink: meetEvent.meetingLink || undefined,
            googleEventId: meetEvent.googleEventId || undefined,
            googleCalendarId: meetEvent.googleCalendarId,
          };
        } catch (error) {
          console.error('Erreur création Google Meet:', error);
        }
      }

      // Créer l'appointment avec ou sans Google Meet
      return await tx.appointment.create({
        data: {
          ...appointmentData,
          ...googleMeetData,
        },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          provider: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, description: true, address: true } },
        },
      });
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
            googleAccessToken: true,
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
    const appointment = await this.findOne(id);

    // Si l'appointment a un événement Google Calendar, le supprimer
    if (appointment.googleEventId && appointment.provider.googleAccessToken) {
      try {
        await this.googleService.deleteEvent(
          appointment.provider.googleAccessToken,
          appointment.googleEventId,
        );
      } catch (error) {
        console.error('Erreur suppression Google Calendar:', error);
        // Continue l'annulation même si la suppression Google échoue
      }
    }

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
    const dateObj = new Date(date);
    const dayOfWeek = getDayOfWeekFromDate(dateObj);

  
    const availabilities = await this.prisma.availability.findMany({
      where: { providerId, dayOfWeek, isActive: true },
    });
    
  
    const allSlots: { startTime: string; endTime: string; duration: number }[] = [];
    for (const avail of availabilities) {
      
      const [startHour, startMin] = avail.startTime.split(':').map(Number);
      const [endHour, endMin] = avail.endTime.split(':').map(Number);
      
      
      let current = new Date(dateObj);
      current.setHours(startHour, startMin, 0, 0);
      
      const end = new Date(dateObj);
      end.setHours(endHour, endMin, 0, 0);
      
      while (current < end) {
        const slotEnd = new Date(current.getTime() + avail.slotDuration * 60000);
        
        allSlots.push({
          startTime: current.toISOString(),
          endTime: slotEnd.toISOString(),
          duration: avail.slotDuration
        });
        
        current = slotEnd; 
      }
    }
  
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
    
    const appointments = await this.prisma.appointment.findMany({
      where: {
        providerId,
        startTime: { gte: startOfDay, lt: endOfDay },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
      }
    });
    
    const freeSlots = allSlots.filter(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      
      return !appointments.some(apt => {
        return (apt.startTime < slotEnd && apt.endTime > slotStart);
      });
    });
  
    return freeSlots;
  }
}
