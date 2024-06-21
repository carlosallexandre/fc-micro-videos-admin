import { Either } from './either';

export class EitherIterator<Error, Ok> {
  private index = -1;

  constructor(private readonly either: Either<Error, Ok>) {}

  next() {
    this.index++;
    switch (this.index) {
      case 0:
        return { value: this.either.error, done: false };
      case 1:
        return { value: this.either.ok, done: false };
      default:
        return { value: undefined, done: true };
    }
  }
}
