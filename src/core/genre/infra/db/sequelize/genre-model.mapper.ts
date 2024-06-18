import { Genre } from '@core/genre/domain/genre.aggregate';
import { GenreModel, GenreModelProps } from './genre.model';
import { GenreCategoryModel } from './genre-category.model';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { Notification } from '@core/@shared/domain/notification';
import { CategoryId } from '@core/category/domain/category-id.vo';
import { LoadEntityError } from '@core/@shared/domain/errors/validation.error';

export class GenreModelMapper {
  static toDomain(model: GenreModel): Genre {
    const categories_id = model.categories_id ?? [];
    const categoriesId = categories_id.map(
      (c) => new CategoryId(c.category_id),
    );

    const notification = new Notification();
    if (categoriesId.length == 0) {
      notification.addError(
        'categories_id should not be empty',
        'categories_id',
      );
    }

    const genre = new Genre({
      id: new GenreId(model.id),
      name: model.name,
      is_active: model.is_active,
      created_at: model.created_at,
      categories_id: new Map(categoriesId.map((c) => [c.value, c])),
    });

    genre.validate();

    notification.copyErrors(genre.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return genre;
  }

  static toModelProps(genre: Genre) {
    const genreId = genre.id.toString();

    return {
      id: genreId,
      name: genre.name,
      is_active: genre.is_active,
      created_at: genre.created_at,
      categories_id: [...genre.categories_id.values()].map(
        (categoryId) =>
          new GenreCategoryModel({
            genre_id: genreId,
            category_id: categoryId.toString(),
          }),
      ),
    };
  }
}
