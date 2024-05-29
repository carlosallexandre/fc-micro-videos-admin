import { Category } from "./category.entity";

describe("Category Unit Tests", () => {
  describe("Create", () => {
    it("should create with defaults", () => {
      const category = Category.create({ name: "Categoria" });
      expect(category.toJSON()).toMatchObject({
        category_id: expect.any(String),
        name: "Categoria",
        description: null,
        is_active: true,
        created_at: expect.any(Date),
      });
    });

    it.todo("should create with defaults");
  });

  describe("Commands", () => {
    it.todo("should change a category name");

    it.todo("should change a category description");

    it.todo("should activate a category");

    it.todo("should deactivate a category");
  });
});
