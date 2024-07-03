import { VideoAudioMediaReplacedIntegrationEvent } from '@core/video/domain/events/video-audio-media-replaced.event';

export const EVENTS_CONFIG_MESSAGE_BROKER = {
  [VideoAudioMediaReplacedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routing_key: VideoAudioMediaReplacedIntegrationEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routing_key: 'TestEvent',
  },
};
