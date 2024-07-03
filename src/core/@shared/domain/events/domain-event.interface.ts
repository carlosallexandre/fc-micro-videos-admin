import { ValueObject } from '../value-objects/value-object';

export interface IDomainEvent {
  aggregate_id: ValueObject;
  occurred_on: Date;
  event_version: number;
  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  event_version: number;
  event_name: string;
  occurred_on: Date;
  payload: T;
}
