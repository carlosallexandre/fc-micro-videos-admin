import { CategoryInMemoryRepository } from "../../../infra/db/in-memory/category-in-memory.repository";
import { CreateCategoryUseCase } from "./create-category.use-case";

describe("CreateCategoryUseCase Unit Tests", () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it("should throws an error when entity is not valid", async () => {
    const input = { name: "t".repeat(256) };
    await expect(useCase.execute(input)).rejects.toThrow(
      "Entity Validation Error"
    );
  });

  it("should create a category", async () => {
    const spyInsert = jest.spyOn(repository, "insert");

    const output = await useCase.execute({ name: "test" });

    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toEqual(
      expect.objectContaining({
        name: "test",
        description: null,
        is_active: true,
      })
    );
  });

  it("should create a category with description and is_active", async () => {
    const spyInsert = jest.spyOn(repository, "insert");

    const output = await useCase.execute({
      name: "test",
      description: "some description",
      is_active: false,
    });

    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toEqual(
      expect.objectContaining({
        name: "test",
        description: "some description",
        is_active: false,
      })
    );
  });
});
