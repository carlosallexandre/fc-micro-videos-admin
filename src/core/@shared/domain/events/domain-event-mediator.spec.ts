import { AggregateRoot } from '../aggregate-root';
import { Uuid } from '../value-objects/uuid.vo';
import { DomainEventMediator } from './domain-event-mediator';
import { IDomainEvent } from './domain-event.interface';

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

class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  action(name: string) {
    this.name = name;
    this.applyEvent(new StubEvent(this.id, this.name));
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
    mediator = new DomainEventMediator();
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
});
