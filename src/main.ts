import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Retire les propriétés non définies dans le DTO
    forbidNonWhitelisted: true, // Rejette la requête si propriétés inconnues
    transform: true,           // Transforme automatiquement les types (string -> number, etc.)
  }));

  // CORS si besoin pour le frontend
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();