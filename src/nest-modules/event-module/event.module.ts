import { DomainEventMediator } from '@core/@shared/domain/events/domain-event-mediator';
import { Global, Module } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    {
      provide: DomainEventMediator,
      inject: [EventEmitter2],
      useFactory(eventEmitter: EventEmitter2) {
        return new DomainEventMediator(eventEmitter);
      },
    },
  ],
  exports: [DomainEventMediator],
})
export class EventModule {}
