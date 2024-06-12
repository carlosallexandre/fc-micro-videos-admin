import { MaxLength } from 'class-validator';
import { ClassValidator } from '@core/@shared/domain/validators/class-validator.validator';

class CategoryRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(props: { name: string }) {
    Object.assign(this, props);
  }
}

class CategoryValidator extends ClassValidator<CategoryRules> {
  validate(data: CategoryRules, ...fields: string[]) {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(new CategoryRules(data), ...newFields);
  }
}

export class CategoryValidatorFactory {
  static create() {
    return new CategoryValidator();
  }
}
