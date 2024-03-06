import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient } from '@azure/service-bus';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SensorData, SensorDataDocument } from './schemas/sensor-data.schema';
import * as dotenv from 'dotenv';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
dotenv.config();

@Injectable()
export class SensorsService {
  constructor(
    @InjectModel(SensorData.name)
    private sensorDataModel: Model<SensorDataDocument>,
    private logger: WinstonLoggerService,
  ) {}

  async listenToQueue(queueName: string) {
    const client = new ServiceBusClient(
      process.env.SERVICE_BUS_CONNECTION_STRING,
    );
    const receiver = client.createReceiver(queueName);
    this.logger.log(`Listening to queue: ${queueName}`);

    receiver.subscribe({
      processMessage: async (message) => {
        this.logger.log(
          `Received message from ${queueName}: ${JSON.stringify(message.body)}`,
        );
        const dataObject = JSON.parse(message.body);
        try {
          const newData = new this.sensorDataModel(dataObject);
          await newData.save();
          this.logger.log(
            `Saved message to database: ${JSON.stringify(newData)}`,
          );
        } catch (error) {
          this.logger.error(
            `Error storing the sensor data: ${error}`,
            error.trace,
          );
        }
      },
      processError: async (args) => {
        this.logger.error(
          `Error processing messages from ${queueName}: ${args.error}`,
          args.error.stack,
        );
      },
    });
  }
}
