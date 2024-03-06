import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorsService } from './sensors.service';
import { SensorData, SensorDataSchema } from './schemas/sensor-data.schema';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SensorData.name, schema: SensorDataSchema },
    ]),
  ],
  providers: [SensorsService, WinstonLoggerService],
})
export class SensorsModule {}
