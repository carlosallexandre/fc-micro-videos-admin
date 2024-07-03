import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { CONFIG_SCHEMA_TYPE } from '../config-module/config.module';
import { ConfigService } from '@nestjs/config';
import { RabbitMQMessageBroker } from '@core/@shared/infra/message-broker/rabbitmq/rabbitmq.message-broker';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error-filter/rabbitmq-consume-error.filter';

export class RabbitmqModule {
  static forRoot(options: { enableConsumers?: boolean } = {}): DynamicModule {
    return {
      global: true,
      module: RabbitmqModule,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory(configService: ConfigService<CONFIG_SCHEMA_TYPE>) {
            return {
              uri: configService.get('RABBITMQ_URI'),
              registerHandlers:
                options.enableConsumers ||
                configService.get('RABBITMQ_REGISTER_HANDLERS'),
              exchanges: [
                {
                  name: 'dlx.exchange',
                  type: 'topic',
                },
                {
                  name: 'direct.delayed',
                  type: 'x-delayed-message',
                  options: {
                    arguments: {
                      'x-delayed-type': 'direct',
                    },
                  },
                },
              ],
              queues: [
                {
                  name: 'dlx.queue',
                  exchange: 'dlx.exchange',
                  routingKey: '#',
                },
              ],
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [RabbitmqConsumeErrorFilter],
      exports: [RabbitMQModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'MessageBroker',
          useFactory(conn: AmqpConnection) {
            return new RabbitMQMessageBroker(conn);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['MessageBroker'],
    };
  }
}
