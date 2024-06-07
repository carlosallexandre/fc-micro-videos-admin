import { OmitType } from '@nestjs/mapped-types';
import { UpdateCategoryInput } from '@core/category/application/use-cases/update-category/update-category.input';

class UpdateCategoryDtoWithoutId extends OmitType(UpdateCategoryInput, [
  'id',
] as const) {}

export class UpdateCategoryDto extends UpdateCategoryDtoWithoutId {}
