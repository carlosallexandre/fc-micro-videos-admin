import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/@shared/domain/events/domain-event.interface';
import { Trailer } from '../trailer.vo';
import { VideoId } from '../video-id.vo';
import { VideoMedia } from '../video-media.vo';

type VideoAudioMediaReplacedProps = {
  aggregate_id: VideoId;
  media: Trailer | VideoMedia;
  media_type: 'trailer' | 'video';
};

export class VideoAudioMediaReplaced implements IDomainEvent {
  aggregate_id: VideoId;
  occurred_on: Date;
  event_version: number;

  readonly media: Trailer | VideoMedia;
  readonly media_type: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedProps) {
    this.aggregate_id = props.aggregate_id;
    this.media = props.media;
    this.media_type = props.media_type;
    this.occurred_on = new Date();
    this.event_version = 1;
  }

  getIntegrationEvent() {
    return new VideoAudioMediaReplacedIntegrationEvent(this);
  }
}

export class VideoAudioMediaReplacedIntegrationEvent
  implements IIntegrationEvent
{
  declare event_version: number;
  declare event_name: string;
  declare occurred_on: Date;
  declare payload: any;

  resource_id: string;
  file_path: string;

  constructor(event: VideoAudioMediaReplaced) {
    // this.event_version = event.event_version;
    // this.occurred_on = event.occurred_on;
    // this.payload = {};
    // this.event_name = this.constructor.name;
    this.resource_id = `${event.aggregate_id.value}.${event.media_type}`;
    this.file_path = event.media.raw_url;
  }
}
