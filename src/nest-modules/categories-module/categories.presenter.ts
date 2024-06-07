import { CategoryOutput } from '@core/category/application/use-cases/common/category-output';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';
import { ListCategoriesOutput } from '@core/category/application/use-cases/list-categories/list-categories.use-case';

export class CategoryPresenter {
  id: string;

  name: string;

  description: string | null;

  is_active: boolean;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(props: CategoryOutput) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.is_active = props.is_active;
    this.created_at = props.created_at;
  }
}

export class CategoryCollectionPresenter extends CollectionPresenter {
  data: CategoryPresenter[];

  constructor(output: ListCategoriesOutput) {
    const { items, ...paginationPros } = output;
    super(paginationPros);
    this.data = items.map((i) => new CategoryPresenter(i));
  }
}
