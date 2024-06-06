import { Notification } from './validators/notification';
import { ValueObject } from './value-objects/value-object';

export abstract class Entity {
  notification: Notification = new Notification();

  abstract get id(): ValueObject;
  abstract toJSON(): Record<string, any>;
}
