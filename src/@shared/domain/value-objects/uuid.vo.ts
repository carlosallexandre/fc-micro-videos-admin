import { v4 as uuidv4, validate } from "uuid";
import { ValueObject } from "./value-object";

export class Uuid extends ValueObject {
  readonly value: string;

  constructor(value?: string) {
    super();
    this.value = value || uuidv4();
    this.validate();
  }

  private validate() {
    const isValid = validate(this.value);
    if (!isValid) throw new InvalidUuidError();
  }

  toString() {
    return this.value;
  }
}

export class InvalidUuidError extends Error {
  constructor(message?: string) {
    super(message || "ID must be a valid UUID");
    this.name = "InvalidUuidError";
  }
}
