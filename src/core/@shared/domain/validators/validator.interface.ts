import { Notification } from './notification';

export type FieldsErrors =
  | {
      [field: string]: string[];
    }
  | string;

export interface IValidator<E = any> {
  validate(data: E, ...fields: string[]): Notification;
  isValid(data: E, ...fields: string[]): boolean;
}
