import { IUseCase } from '@core/@shared/application/use-case.interface';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit-of-work.interface';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { IGenreRepository } from '@core/genre/domain/genre.repository';

export type DeleteGenreInput = { id: string };

export type DeleteGenreOutput = void;

export class DeleteGenreUseCase
  implements IUseCase<DeleteGenreInput, DeleteGenreOutput>
{
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly genreRepo: IGenreRepository,
  ) {}

  execute(input: DeleteGenreInput): Promise<void> {
    return this.uow.do(() => this.genreRepo.delete(new GenreId(input.id)));
  }
}
