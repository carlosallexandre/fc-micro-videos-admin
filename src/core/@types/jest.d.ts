import { ValueObject } from '@core/@shared/domain/value-objects/value-object';

declare global {
  namespace jest {
    interface Matchers<R> {
      notificationContainsErrorMessages: (
        expected: Array<string | { [key: string]: string[] }>,
      ) => R;
      toBeValueObject: (expected: ValueObject) => R;
    }
  }
}
