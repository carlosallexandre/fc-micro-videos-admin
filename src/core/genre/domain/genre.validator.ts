import { ClassValidator } from '@core/@shared/domain/validators/class-validator.validator';
import { MaxLength } from 'class-validator';
import { Genre } from './genre.aggregate';

export class GenreRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(entity: Genre) {
    this.name = entity.name;
  }
}

export class GenreValidator extends ClassValidator {
  validate(data: Genre, ...fields: string[]) {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(new GenreRules(data), ...newFields);
  }
}

export class GenreValidatorFactory {
  static create() {
    return new GenreValidator();
  }
}

export default GenreValidatorFactory;
