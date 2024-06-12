import { ValidatorErrors } from '../validators/validator.interface';

export class EntityValidationError extends Error {
  constructor(
    public error: ValidatorErrors[],
    message = 'Entity Validation Error',
  ) {
    super(message);
  }

  count() {
    return Object.keys(this.error).length;
  }
}
