import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';

@Module({
  imports: [ConfigModule],
  controllers: [GoogleController],
  providers: [GoogleService],
  exports: [GoogleService], // Export pour l'utiliser dans AppointmentsModule
})
export class GoogleModule {}
