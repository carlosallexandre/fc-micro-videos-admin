import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';

export class DomainEventMediator {
  private eventEmitter: EventEmitter2;

  constructor() {
    this.eventEmitter = new EventEmitter2();
  }

  register(event: string, handler: any) {
    this.eventEmitter.on(event, handler);
  }

  async publish(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.getUncommittedEvents()) {
      const eventClassName = event.constructor.name;
      aggregateRoot.markEventAsDispatched(event);
      await this.eventEmitter.emitAsync(eventClassName, event);
    }
  }
}
