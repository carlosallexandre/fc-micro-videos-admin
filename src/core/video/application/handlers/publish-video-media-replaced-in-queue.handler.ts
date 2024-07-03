import { IIntegrationEventHandler } from '@core/@shared/application/domain-event-handler.interface';
import { IMessageBroker } from '@core/@shared/application/message-broker.interface';
import { DomainEventMediator } from '@core/@shared/domain/events/domain-event-mediator';
import { VideoAudioMediaReplacedIntegrationEvent } from '@core/video/domain/events/video-audio-media-replaced.event';

export class PublishVideoMediaReplacedInQueueHandler
  implements IIntegrationEventHandler
{
  constructor(
    private readonly eventMediator: DomainEventMediator,
    private readonly messageBroker: IMessageBroker,
  ) {
    this.eventMediator.register(
      VideoAudioMediaReplacedIntegrationEvent.name,
      this.handle.bind(this),
    );
  }

  async handle(event: VideoAudioMediaReplacedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}
