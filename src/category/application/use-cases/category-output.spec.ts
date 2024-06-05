import { Category } from "../../domain/category.entity";
import { CategoryOutputMapper } from "./category-output";

describe("CategoryOutput Unit Tests", () => {
  it("should convert a category in output", () => {
    const entity = Category.fake().aCategory().build();

    const output = CategoryOutputMapper.toOutput(entity);

    expect(output).toStrictEqual({
      id: entity.id.toString(),
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  });
});
