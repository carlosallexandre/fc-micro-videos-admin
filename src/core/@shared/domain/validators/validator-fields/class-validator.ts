import { validateSync } from 'class-validator';
import { Notification } from '../notification';
import { IValidatorFields } from './validator.interface';

export abstract class ClassValidatorFields implements IValidatorFields {
  validate(notification: Notification, data: any, fields: string[]): boolean {
    const errors = validateSync(data, { groups: fields });

    for (const error of errors) {
      const field = error.property;
      Object.values(error.constraints!).forEach((message) => {
        notification.addError(message, field);
      });
    }

    return !errors.length;
  }
}
