import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../domain/aggregate-root';
import { DomainEventMediator } from '../domain/events/domain-event-mediator';
import { IUnitOfWork } from '../domain/repository/unit-of-work.interface';
import { ValueObject } from '../domain/value-objects/value-object';
import { UnitOfWorkInMemory } from '../infra/db/in-memory/in-memory-unit-of-work';
import { ApplicationService } from './application.service';

class StubAggregate extends AggregateRoot {
  get id(): ValueObject {
    throw new Error('Method not implemented.');
  }

  toJSON(): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}

describe('ApplicationService Unit Tests', () => {
  let uow: IUnitOfWork;
  let domainEventMediator: DomainEventMediator;
  let applicationService: ApplicationService;

  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    domainEventMediator = new DomainEventMediator(new EventEmitter2());
    applicationService = new ApplicationService(uow, domainEventMediator);
  });

  describe('start', () => {
    it('should call the start method of unit of work', async () => {
      const startSpy = jest.spyOn(uow, 'start');

      await applicationService.start();

      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('should call the publish method of domain event mediator and the commit method', async () => {
      const aggregateRoot = new StubAggregate();
      uow.addAggregateRoot(aggregateRoot);
      const publishSpy = jest.spyOn(domainEventMediator, 'publish');
      const commitSpy = jest.spyOn(uow, 'commit');

      await applicationService.finish();

      expect(publishSpy).toHaveBeenCalledWith(aggregateRoot);
      expect(commitSpy).toHaveBeenCalled();
    });
  });

  describe('fail', () => {
    it('should call the rollback method of unit of work', async () => {
      const rollbackSpy = jest.spyOn(uow, 'rollback');

      await applicationService.fail();

      expect(rollbackSpy).toHaveBeenCalled();
    });
  });

  describe('run', () => {
    it('should start, execute the callback, finish and return the result', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      const startSpy = jest.spyOn(applicationService, 'start');
      const finishSpy = jest.spyOn(applicationService, 'finish');

      const result = await applicationService.run(callback);

      expect(startSpy).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(finishSpy).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback adn throw the error if the callback throws an error', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('test-error'));
      const failSpy = jest.spyOn(applicationService, 'fail');

      await expect(applicationService.run(callback)).rejects.toThrow(
        'test-error',
      );
      expect(failSpy).toHaveBeenCalled();
    });
  });
});
