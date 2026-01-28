import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createAvailabilityDto: CreateAvailabilityDto) {
    return this.prisma.availability.create({
      data: createAvailabilityDto,
      include: {
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
    return this.prisma.availability.findMany({
      include: {
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
    const availability = await this.prisma.availability.findUnique({
      where: { id },
      include: {
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

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }

    return availability;
  }

  async findByProvider(providerId: string) {
    return this.prisma.availability.findMany({
      where: { providerId },
      include: {
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

  async update(id: string, updateAvailabilityDto: UpdateAvailabilityDto) {
    await this.findOne(id);

    return this.prisma.availability.update({
      where: { id },
      data: updateAvailabilityDto,
      include: {
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

    return this.prisma.availability.delete({
      where: { id },
    });
  }
}
