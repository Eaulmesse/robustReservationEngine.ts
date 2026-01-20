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

@Controller('availabilities')
@UseGuards(JwtAuthGuard)
export class AvailabilitiesController {
  constructor(
    private readonly availabilitiesService: AvailabilitiesService,
  ) {}

  @Post()
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
  update(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilitiesService.update(id, updateAvailabilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availabilitiesService.remove(id);
  }
}
