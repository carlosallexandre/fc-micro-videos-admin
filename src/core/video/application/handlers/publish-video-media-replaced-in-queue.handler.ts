import { IDomainEventHandler } from '@core/@shared/application/domain-event-handler.interface';
import { DomainEventMediator } from '@core/@shared/domain/events/domain-event-mediator';
import { IDomainEvent } from '@core/@shared/domain/events/domain-event.interface';
import { VideoAudioMediaReplaced } from '@core/video/domain/events/video-audio-media-replaced.event';

export class PublishVideoMediaReplacedInQueueHandler
  implements IDomainEventHandler
{
  constructor(private readonly eventMediator: DomainEventMediator) {
    this.eventMediator.register(
      VideoAudioMediaReplaced.name,
      this.handle.bind(this),
    );
  }

  async handle(event: IDomainEvent): Promise<void> {
    console.log(event);
  }
}
