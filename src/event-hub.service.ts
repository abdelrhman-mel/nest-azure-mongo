import { Injectable, Logger } from '@nestjs/common';
import { EventHubConsumerClient } from '@azure/event-hubs';
import * as dotenv from 'dotenv';
import { ServiceBusService } from './service-bus.service';
import { WinstonLoggerService } from './logger/winston-logger.service';
dotenv.config();

@Injectable()
export class EventHubService {
  private consumerClient: EventHubConsumerClient;

  constructor(
    private azureServiceBusService: ServiceBusService,
    private logger: WinstonLoggerService,
  ) {
    this.consumerClient = new EventHubConsumerClient(
      process.env.EVENT_HUB_CONSUMER_GROUP,
      process.env.EVENT_HUB_CONNECTION_STRING,
      process.env.EVENT_HUB_NAME,
    );
  }

  async consumeEvents() {
    // Start receiving events
    this.consumerClient.subscribe({
      processEvents: async (events) => {
        if (events.length === 0) {
          this.logger.log('No events received in this interval.');
        }
        for (const event of events) {
          this.logger.log(`Received event: ${JSON.stringify(event.body)}`);
          await this.azureServiceBusService.sendMessageBasedOnTemperature(
            event.body,
          );
        }
      },
      processError: async (error) => {
        this.logger.log(`Error : ${error}`);
      },
    });
    this.logger.log('Event Hub consumer client started.');
  }
}
