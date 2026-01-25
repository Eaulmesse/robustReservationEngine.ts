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
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../generated/prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('availabilities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilitiesController {
  constructor(
    private readonly availabilitiesService: AvailabilitiesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilitiesService.create(createAvailabilityDto);
  }

  @Get()
  findAll(@Query('providerId') providerId?: string) {
    if (providerId) {
      return this.availabilitiesService.findByProvider(providerId);
    }
    return this.availabilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availabilitiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilitiesService.update(id, updateAvailabilityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.availabilitiesService.remove(id);
  }
}
