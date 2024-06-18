import { Genre } from './genre.aggregate';
import GenreValidatorFactory from './genre.validator';

describe('GenreValidator Unit Tests', () => {
  const validator = GenreValidatorFactory.create();

  it('should validate genre name', () => {
    const genre = Genre.fake().aGenre().build();
    const notification = validator.validate(genre);
    expect(notification.hasErrors()).toBeFalsy();
  });

  it('should notify a genre name too long', () => {
    const genre = Genre.fake().aGenre().withInvalidNameTooLong().build();
    const notification = validator.validate(genre);
    expect(notification.hasErrors()).toBeTruthy();
    expect(notification.toJSON()).toStrictEqual([
      { name: ['name must be shorter than or equal to 255 characters'] },
    ]);
  });
});
