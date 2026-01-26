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
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../generated/prisma';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('availabilities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilitiesController {
  constructor(
    private readonly availabilitiesService: AvailabilitiesService,
  ) {}

  @Post()
  create(@Body() createAvailabilityDto: CreateAvailabilityDto, @CurrentUser() user: any) {
    // Un provider peut créer ses propres disponibilités
    // Un admin peut créer des disponibilités pour n'importe qui
    if (user.role !== UserRole.ADMIN && createAvailabilityDto.providerId !== user.id) {
      throw new ForbiddenException('Vous ne pouvez créer des disponibilités que pour vous-même');
    }
    
    return this.availabilitiesService.create(createAvailabilityDto);
  }

  @Get()
  findAll(@Query('providerId') providerId?: string) {
    // Tout le monde peut voir les disponibilités (pour réserver)
    if (providerId) {
      return this.availabilitiesService.findByProvider(providerId);
    }
    return this.availabilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Tout le monde peut voir une disponibilité
    return this.availabilitiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @CurrentUser() user: any,
  ) {
    const availability = await this.availabilitiesService.findOne(id);
    
    // Seul le provider propriétaire ou un admin peut modifier
    if (user.role !== UserRole.ADMIN && availability.providerId !== user.id) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres disponibilités');
    }
    
    return this.availabilitiesService.update(id, updateAvailabilityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const availability = await this.availabilitiesService.findOne(id);
    
    // Seul le provider propriétaire ou un admin peut supprimer
    if (user.role !== UserRole.ADMIN && availability.providerId !== user.id) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres disponibilités');
    }
    
    return this.availabilitiesService.remove(id);
  }
}
