import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQMessageBroker } from './rabbitmq.message-broker';
import { Config } from '../../config';
import { Uuid } from '@core/@shared/domain/value-objects/uuid.vo';
import { IIntegrationEvent } from '@core/@shared/domain/events/domain-event.interface';

class TestEvent implements IIntegrationEvent {
  occurred_on: Date = new Date();
  event_name: string = TestEvent.name;
  event_version: number = 1;
  constructor(readonly payload: any) {}
}

describe('RabbitMQMessageBroker Integration Tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: AmqpConnection;

  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitMQ(),
      connectionInitOptions: { wait: true },
      logger: {
        log: () => {},
        error: () => {},
        warn: () => {},
      },
    });

    await connection.init();

    const channel = connection.channel;
    await channel.assertExchange('test-exchange', 'direct', { durable: false });
    await channel.assertQueue('test-queue', { durable: false });
    await channel.purgeQueue('test-queue');
    await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');

    service = new RabbitMQMessageBroker(connection);
  });

  afterEach(async () => {
    try {
      await connection.managedConnection.close();
    } catch (err) {}
  });

  it('should pulish events', async () => {
    const event = new TestEvent(new Uuid());

    await service.publishEvent(event);

    await expect(
      new Promise((res) => connection.channel.consume('test-queue', res)).then(
        (msg: ConsumeMessage) => JSON.parse(msg.content.toString()),
      ),
    ).resolves.toStrictEqual({
      event_name: TestEvent.name,
      event_version: 1,
      occurred_on: event.occurred_on.toISOString(),
      payload: { value: event.payload.value },
    });
  });
});
