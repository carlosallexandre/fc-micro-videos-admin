import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';
import { Uuid } from '../value-objects/uuid.vo';
import { DomainEventMediator } from './domain-event-mediator';
import { IDomainEvent, IIntegrationEvent } from './domain-event.interface';

class StubEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number;

  constructor(
    public aggregate_id: Uuid,
    public name: string,
  ) {
    this.occurred_on = new Date();
    this.event_version = 1;
  }
}

class StubEventWithIntegrationEvent extends StubEvent {
  getIntegrationEvent(): StubIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  event_version: number;
  event_name: string;
  occurred_on: Date;
  payload: any;

  constructor(event: StubEvent) {
    this.occurred_on = event.occurred_on;
    this.event_version = event.event_version;
    this.payload = event;
    this.event_name = this.constructor.name;
  }
}

class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  action(name: string) {
    this.name = name;
    this.applyEvent(new StubEvent(this.id, this.name));
  }

  actionWithIntegrationEvent(name: string) {
    this.name = name;
    this.applyEvent(new StubEventWithIntegrationEvent(this.id, this.name));
  }

  toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
    };
  }
}

describe('DomainEventMediator Unit Tests', () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    mediator = new DomainEventMediator(new EventEmitter2());
  });

  it('should publish handler', async () => {
    expect.assertions(1);

    mediator.register(StubEvent.name, (event: StubEvent) =>
      expect(event.name).toBe('test'),
    );

    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publish(aggregate);
    await mediator.publish(aggregate);
  });

  it('should not publish an integration event when', () => {
    const spyEmitAsync = jest.spyOn(mediator['eventEmitter'], 'emitAsync');

    const aggregate = new StubAggregate();
    aggregate.action('test');

    expect(spyEmitAsync).not.toHaveBeenCalled();
  });

  it('should publish integration event', async () => {
    expect.assertions(4);
    mediator.register(
      StubIntegrationEvent.name,
      async (event: StubIntegrationEvent) => {
        expect(event.event_name).toBe(StubIntegrationEvent.name);
        expect(event.event_version).toBe(1);
        expect(event.occurred_on).toBeInstanceOf(Date);
        expect(event.payload.name).toBe('test');
      },
    );

    const aggregate = new StubAggregate();
    aggregate.actionWithIntegrationEvent('test');
    await mediator.publishIntegrationEvents(aggregate);
  });
});
