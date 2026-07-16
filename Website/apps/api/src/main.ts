import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: origin.split(',').map((o) => o.trim()),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`RuangTemu API listening on http://localhost:${port}/api`);
}
void bootstrap();
