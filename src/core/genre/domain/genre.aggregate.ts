import { AggregateRoot } from '@core/@shared/domain/aggregate-root';
import { CategoryId } from '@core/category/domain/category-id.vo';
import { GenreId } from './genre-id.vo';
import { GenreFakeBuilder } from './genre-fake.builder';

type GenreProps = {
  id: GenreId;
  name: string;
  is_active: boolean;
  categories_id: Map<string, CategoryId>;
  created_at: Date;
};

export class Genre extends AggregateRoot {
  private props: GenreProps;

  static create(props: {
    name: string;
    is_active?: boolean;
    categories_id: CategoryId[];
  }) {
    const genre = new Genre({
      ...props,
      categories_id: new Map(props.categories_id.map((c) => [c.value, c])),
    });
    return genre;
  }

  static fake() {
    return GenreFakeBuilder;
  }

  constructor(props: {
    id?: GenreId;
    name: string;
    is_active?: boolean;
    categories_id: Map<string, CategoryId>;
    created_at?: Date;
  }) {
    super();
    this.props = {
      id: props.id ?? new GenreId(),
      name: props.name,
      categories_id: props.categories_id,
      is_active: props.is_active ?? true,
      created_at: props.created_at ?? new Date(),
    };
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get categories_id() {
    return this.props.categories_id;
  }

  get is_active() {
    return this.props.is_active;
  }

  get created_at() {
    return this.props.created_at;
  }

  changeName(value: string) {
    this.props.name = value;
  }

  addCategoryId(category_id: CategoryId) {
    this.props.categories_id.set(category_id.value, category_id);
  }

  removeCategoryId(category_id: CategoryId) {
    this.props.categories_id.delete(category_id.value);
  }

  syncCategoriesId(categories_id: CategoryId[]) {
    if (categories_id.length == 0) {
      throw new Error('Categories id is empty');
    }

    this.props.categories_id = new Map(
      categories_id.map((category_id) => [category_id.value, category_id]),
    );
  }

  activate() {
    this.props.is_active = true;
  }

  deactivate() {
    this.props.is_active = false;
  }

  toJSON() {
    return {
      id: this.props.id.value,
      name: this.props.name,
      categories_id: [...this.props.categories_id.values()].map((c) => c.value),
      is_active: this.props.is_active,
      created_at: this.props.created_at,
    };
  }
}
