import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async create(createProviderDto: CreateProviderDto) {
    return this.prisma.provider.create({
      data: createProviderDto,
    });
  }

  async findAll() {
    return this.prisma.provider.findMany({
      include: {
        availabilities: true,
        appointments: true,
      },
    });
  }

  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        availabilities: true,
        appointments: true,
      },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return provider;
  }

  async update(id: string, updateProviderDto: UpdateProviderDto) {
    await this.findOne(id);

    return this.prisma.provider.update({
      where: { id },
      data: updateProviderDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.provider.delete({
      where: { id },
    });
  }
}
