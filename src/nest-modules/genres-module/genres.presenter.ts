import {
  GenreCategoryOutput,
  GenreOutput,
} from '@core/genre/application/use-cases/common/genre-output.mapper';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';
import { ListGenresOutput } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';

export class GenreCategoryPresenter {
  id: string;

  name: string;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: GenreCategoryOutput) {
    Object.assign(this, output);
  }
}

export class GenrePresenter {
  id: string;

  name: string;

  categories_id: string[];

  categories: GenreCategoryPresenter[];

  is_active: boolean;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: GenreOutput) {
    this.id = output.id;
    this.name = output.name;
    this.categories_id = output.categories_id;
    this.categories = output.categories.map(
      (v) => new GenreCategoryPresenter(v),
    );
    this.is_active = output.is_active;
    this.created_at = output.created_at;
  }
}

export class GenreCollectionPresenter extends CollectionPresenter {
  @Type(() => GenrePresenter)
  data: GenrePresenter[];

  constructor(output: ListGenresOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new GenrePresenter(item));
  }
}
