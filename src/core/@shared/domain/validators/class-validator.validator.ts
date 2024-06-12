import { validateSync } from 'class-validator';
import { Notification } from './notification';
import { IValidator } from './validator.interface';

export abstract class ClassValidator<E extends object = any>
  implements IValidator<E>
{
  validate(data: E, ...fields: string[]): Notification {
    const notification = new Notification();
    const errors = validateSync(data, { groups: fields });

    for (const error of errors) {
      const field = error.property;
      Object.values(error.constraints!).forEach((message) => {
        notification.addError(message, field);
      });
    }

    return notification;
  }

  isValid(data: E, ...fields: string[]): boolean {
    return this.validate(data, ...fields).hasErrors();
  }
}
