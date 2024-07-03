import { Uuid } from '@core/@shared/domain/value-objects/uuid.vo';
import { IIntegrationEvent } from '@core/@shared/domain/events/domain-event.interface';
import { RabbitMQMessageBroker } from './rabbitmq.message-broker';
import { EVENTS_CONFIG_MESSAGE_BROKER } from './events-config.message-broker';

class TestEvent implements IIntegrationEvent {
  occurred_on: Date = new Date();
  event_name: string = TestEvent.name;
  event_version: number = 1;
  constructor(readonly payload: any) {}
}

describe('RabbitMQMessageBroker Unit Tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: { publish(...args: any): Promise<void> };

  beforeEach(() => {
    connection = { publish: jest.fn() };
    service = new RabbitMQMessageBroker(connection as any);
  });

  it('should publish events', async () => {
    const event = new TestEvent(new Uuid());

    await service.publishEvent(event);

    expect(connection.publish).toHaveBeenCalledWith(
      EVENTS_CONFIG_MESSAGE_BROKER[TestEvent.name].exchange,
      EVENTS_CONFIG_MESSAGE_BROKER[TestEvent.name].routing_key,
      event,
    );
  });
});
