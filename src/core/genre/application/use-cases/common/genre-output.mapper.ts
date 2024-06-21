import { Category } from '@core/category/domain/category.aggregate';
import { Genre } from '@core/genre/domain/genre.aggregate';

export type GenreCategoryOutput = {
  id: string;
  name: string;
  created_at: Date;
};

export type GenreOutput = {
  id: string;
  name: string;
  categories: GenreCategoryOutput[];
  categories_id: string[];
  is_active: boolean;
  created_at: Date;
};

export class GenreOutputMapper {
  static toOutput(genre: Genre, categories: Category[]): GenreOutput {
    return {
      id: genre.id.value,
      name: genre.name,
      categories: categories.map((c) => ({
        id: c.id.value,
        name: c.name,
        created_at: c.created_at,
      })),
      categories_id: categories.map((c) => c.id.value),
      is_active: genre.is_active,
      created_at: genre.created_at,
    };
  }
}
