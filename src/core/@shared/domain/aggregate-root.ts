import EventEmitter2 from 'eventemitter2';
import { Entity } from './entity';
import { IDomainEvent } from './events/domain-event.interface';

export abstract class AggregateRoot extends Entity {
  localMediator = new EventEmitter2();
  events: Set<IDomainEvent> = new Set<IDomainEvent>();
  dispatchedEvents: Set<IDomainEvent> = new Set<IDomainEvent>();

  // Dispara o evento somente para o próprio aggregate
  applyEvent(event: IDomainEvent) {
    this.events.add(event);
    this.localMediator.emit(event.constructor.name, event);
  }

  registerHandler(event: string, handler: (event: IDomainEvent) => void) {
    this.localMediator.on(event, handler);
  }

  markEventAsDispatched(event: IDomainEvent) {
    this.dispatchedEvents.add(event);
  }

  getUncommittedEvents(): IDomainEvent[] {
    return Array.from(this.events).filter(
      (event) => !this.dispatchedEvents.has(event),
    );
  }

  clearEvents() {
    this.events.clear();
    this.dispatchedEvents.clear();
  }
}
