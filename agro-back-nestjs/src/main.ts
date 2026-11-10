import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { envs } from './core/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1); // Railway está detrás de proxy: sin esto req.ip es la IP del proxy
  
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true,
      transform: true,      // habilita @Transform y conversión de tipos
    })
  );

  app.use(cookieParser());
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });


  await app.listen(envs.port);

}
bootstrap();
