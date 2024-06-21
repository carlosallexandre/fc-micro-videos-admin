import { EitherIterator } from './either-iterator';

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

export class Either<ErrorType = Error, Ok = unknown> {
  private _ok: Ok;
  private _error: ErrorType;

  private constructor(ok: Ok, error: ErrorType) {
    this._ok = ok;
    this._error = error;
  }

  get ok() {
    return this._ok;
  }

  get error() {
    return this._error;
  }

  isOk() {
    return this.ok !== null;
  }

  isFail() {
    return this.error !== null;
  }

  static safe<ErrorType = Error, Ok = unknown>(
    fn: () => Ok,
  ): Either<ErrorType, Ok> {
    try {
      return Either.ok(fn());
    } catch (e) {
      return Either.fail(e);
    }
  }

  static ok<ErrorType = Error, Ok = unknown>(
    okValue: Ok,
  ): Either<ErrorType, Ok> {
    return new Either(okValue, null);
  }

  static fail<ErrorType = Error, Ok = unknown>(
    error: ErrorType,
  ): Either<ErrorType, Ok> {
    return new Either(null, error);
  }

  /**
   * This method is used to transform the value into a new value.
   * The new value always will be an ok.
   */
  map<NewOk>(fn: (value: Ok) => NewOk): Either<ErrorType, NewOk> {
    if (this.isFail()) {
      return Either.fail(this.error);
    }
    return Either.ok(fn(this.ok));
  }

  /**
   * This method is used to create a new Either from the value of an Either.
   * THe new Either can be a fail or an ok.
   */
  chain<NewError, NewOk>(
    fn: (value: Ok) => Either<NewError, NewOk>,
  ): Either<ErrorType | NewError, NewOk> {
    if (this.isFail()) {
      return Either.fail(this.error);
    }
    return fn(this.ok);
  }

  /**
   * This method is used to create a new Either from the value of an Either.
   * This method is used to work with arrays.
   * If one of the values is a faile, the new Either will be a fail.
   * The new Either can be a fail or an ok.
   */
  chainEach<NewError, NewOk>(
    fn: (value: Flatten<Ok>) => Either<Flatten<NewError>, Flatten<NewOk>>,
  ): Either<ErrorType | Flatten<NewError>[], Flatten<NewOk>[]> {
    if (this.isFail()) {
      return Either.fail(this.error);
    }

    if (!Array.isArray(this.ok)) {
      throw new Error('Method chainEach only works with arrays');
    }

    const result = this.ok.map(fn);
    const errors = result.filter((r) => r.isFail());
    if (errors.length > 0) {
      return Either.fail(errors.map((e) => e.error));
    }

    return Either.ok(result.map((r) => r.ok));
  }

  [Symbol.iterator]() {
    return new EitherIterator(this);
  }
}
