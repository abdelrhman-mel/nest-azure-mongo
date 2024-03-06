import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ConsoleLogger } from '@nestjs/common';
import { SensorsService } from './sensors/sensors.service';
import { WinstonLoggerService } from './logger/winston-logger.service';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerService(),
  });
  const sensorsService = app.get(SensorsService);
  [process.env.LOW, process.env.MED, process.env.HIGH].forEach((queue) =>
    sensorsService.listenToQueue(queue),
  );
  app.useLogger(new ConsoleLogger());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
