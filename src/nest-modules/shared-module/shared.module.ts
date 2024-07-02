import { ApplicationService } from '@core/@shared/application/application.service';
import { DomainEventMediator } from '@core/@shared/domain/events/domain-event-mediator';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { GoogleCloudStorage } from '@core/@shared/infra/storage/google-cloud/google-cloud.storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'Storage',
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return new GoogleCloudStorage(configService);
      },
    },
    {
      provide: ApplicationService,
      inject: ['UnitOfWork', DomainEventMediator],
      useFactory(uow: IUnitOfWork, domainEventMediator: DomainEventMediator) {
        return new ApplicationService(uow, domainEventMediator);
      },
    },
  ],
  exports: [ApplicationService, 'Storage'],
})
export class SharedModule {}
