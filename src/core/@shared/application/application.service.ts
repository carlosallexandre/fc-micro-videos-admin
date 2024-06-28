import { DomainEventMediator } from '../domain/events/domain-event-mediator';
import { IUnitOfWork } from '../domain/repository/unit-of-work.interface';

export class ApplicationService {
  constructor(
    private uow: IUnitOfWork,
    private domainEventMediator: DomainEventMediator,
  ) {}

  async start() {
    await this.uow.start();
  }

  async finish() {
    for (const aggregateRoot of this.uow.getAggregateRoots()) {
      await this.domainEventMediator.publish(aggregateRoot);
    }
    await this.uow.commit();
  }

  async fail() {
    await this.uow.rollback();
  }

  async run<T>(callback: () => Promise<T>): Promise<T> {
    try {
      await this.start();
      const result = await callback();
      await this.finish();
      return result;
    } catch (error) {
      await this.fail();
      throw error;
    }
  }
}
