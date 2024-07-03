import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConsumeMessage, MessagePropertyHeaders } from 'amqplib';

@Catch()
export class RabbitmqConsumeErrorFilter implements ExceptionFilter {
  static readonly RETRY_COUNT_HEADER = 'x-retry-count';

  static readonly MAX_RETRIES = 3;

  static readonly NON_RETRIABLE_ERROS = [
    NotFoundError,
    EntityValidationError,
    UnprocessableEntityException,
  ];

  private logger = new Logger(RabbitmqConsumeErrorFilter.name);

  constructor(private amqpConnection: AmqpConnection) {}

  async catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') return;

    if (this.isNonRetriableError(exception)) return new Nack(false);

    const ctx = host.switchToRpc();
    const message = ctx.getContext<ConsumeMessage>();

    // prettier-ignore
    this.logger.log({
      exception,
      retry_count: message.properties.headers[RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER],
    });

    if (this.shouldRetry(message.properties.headers)) {
      await this.retry(message);
    } else return new Nack(false);
  }

  private isNonRetriableError(exception: Error) {
    return RabbitmqConsumeErrorFilter.NON_RETRIABLE_ERROS.some(
      (error) => exception instanceof error,
    );
  }

  private shouldRetry(headers: MessagePropertyHeaders) {
    const RETRY_HEADER = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;
    const MAX_RETRIES = RabbitmqConsumeErrorFilter.MAX_RETRIES;
    return !(RETRY_HEADER in headers) || headers[RETRY_HEADER] < MAX_RETRIES;
  }

  private async retry(message: ConsumeMessage) {
    const headers = message.properties.headers;
    const RETRY_HEADER = RabbitmqConsumeErrorFilter.RETRY_COUNT_HEADER;

    headers[RETRY_HEADER] = headers[RETRY_HEADER]
      ? headers[RETRY_HEADER] + 1
      : 1;
    headers['x-delay'] = 5000; // 5s;

    return this.amqpConnection.publish(
      'direct.delayed',
      message.fields.routingKey,
      message.content,
      {
        correlationId: message.properties.correlationId,
        headers,
      },
    );
  }
}
