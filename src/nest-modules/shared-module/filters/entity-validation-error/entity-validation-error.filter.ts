import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { union } from 'lodash';

@Catch(EntityValidationError)
export class EntityValidationErrorFilter implements ExceptionFilter {
  catch(exception: EntityValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.status(422).json({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: union(
        ...exception.error.reduce(
          (acc, error) =>
            acc.concat(
              typeof error === 'string'
                ? [[error]]
                : [
                    Object.values(error).reduce(
                      (acc, error) => acc.concat(error),
                      [],
                    ),
                  ],
            ),
          [],
        ),
      ),
    });
  }
}
