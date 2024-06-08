import { Category } from '../../../domain/category.aggregate';
import { CategoryOutputMapper } from './category-output';

describe('CategoryOutput Unit Tests', () => {
  it('should convert a category in output', () => {
    const aggregate = Category.fake().aCategory().build();

    const output = CategoryOutputMapper.toOutput(aggregate);

    expect(output).toStrictEqual({
      id: aggregate.id.toString(),
      name: aggregate.name,
      description: aggregate.description,
      is_active: aggregate.is_active,
      created_at: aggregate.created_at,
    });
  });
});
