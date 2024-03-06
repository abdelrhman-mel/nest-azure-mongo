import { ServiceBusClient } from '@azure/service-bus';
import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { WinstonLoggerService } from './logger/winston-logger.service';
dotenv.config();

@Injectable()
export class ServiceBusService {
  private serviceBusClient: ServiceBusClient;

  constructor(private logger: WinstonLoggerService) {
    this.serviceBusClient = new ServiceBusClient(
      process.env.SERVICE_BUS_CONNECTION_STRING,
    );
  }

  async sendMessageBasedOnTemperature(message: {
    sensorId: string;
    temperature: number;
  }): Promise<void> {
    let queueName;

    if (message.temperature <= 22.5) {
      queueName = process.env.LOW;
    } else if (message.temperature > 22.5 && message.temperature <= 28) {
      queueName = process.env.MED;
    } else {
      queueName = process.env.HIGH;
    }

    const sender = this.serviceBusClient.createSender(queueName);
    try {
      await sender.sendMessages({ body: JSON.stringify(message) });
      this.logger.log(`Message sent to queue: ${queueName}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message to queue ${queueName}`,
        error.toString(),
      );
    } finally {
      await sender.close();
    }
  }
}
