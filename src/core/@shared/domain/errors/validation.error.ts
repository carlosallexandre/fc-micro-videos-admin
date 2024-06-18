import { ValidatorErrors } from '../validators/validator.interface';

abstract class ValidationError extends Error {
  abstract readonly name: string;

  constructor(
    public error: ValidatorErrors[],
    message = 'Validation Error',
  ) {
    super(message);
  }

  count() {
    return Object.keys(this.error).length;
  }
}

export class EntityValidationError extends ValidationError {
  readonly name = 'EntityValidationError';

  constructor(error: ValidatorErrors[], message = 'Entity Validation Error') {
    super(error, message);
  }
}

export class SearchValidationError extends ValidationError {
  readonly name = 'SearchValidationError';

  constructor(error: ValidatorErrors[], message = 'Search Validation Error') {
    super(error, message);
  }
}

export class LoadEntityError extends ValidationError {
  readonly name = 'LoadEntityError';

  constructor(error: ValidatorErrors[], message = 'Load Entity Error') {
    super(error, message);
  }
}
