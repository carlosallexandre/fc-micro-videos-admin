import { IMessageBroker } from '@core/@shared/application/message-broker.interface';
import { IIntegrationEvent } from '@core/@shared/domain/events/domain-event.interface';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EVENTS_CONFIG_MESSAGE_BROKER } from './events-config.message-broker';

export class RabbitMQMessageBroker implements IMessageBroker {
  constructor(private readonly conn: AmqpConnection) {}

  async publishEvent(event: IIntegrationEvent): Promise<void> {
    const config = EVENTS_CONFIG_MESSAGE_BROKER[event.constructor.name];
    await this.conn.publish(config.exchange, config.routing_key, event);
  }
}
