import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventHubService } from './event-hub.service';
import { ServiceBusService } from './service-bus.service';
import { SensorsModule } from './sensors/sensors.module';
import { WinstonLoggerService } from './logger/winston-logger.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), SensorsModule],
  providers: [
    EventHubService,
    ServiceBusService,
    WinstonLoggerService,
    {
      provide: 'APP_LOGGER',
      useClass: WinstonLoggerService,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly eventHubService: EventHubService) {}

  onModuleInit() {
    this.eventHubService.consumeEvents();
  }
}
