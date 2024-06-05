import { NotFoundError } from "../../../../@shared/domain/errors/not-found.error";
import {
  InvalidUuidError,
  Uuid,
} from "../../../../@shared/domain/value-objects/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { CategoryInMemoryRepository } from "../../../infra/db/in-memory/category-in-memory.repository";
import { DeleteCategoryUseCase } from "./delete-category.use-case";

describe("DeleteCategoryUseCase Unit Tests", () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  it("should throws an error with invalid category id", async () => {
    await expect(useCase.execute({ id: "fake id" })).rejects.toThrow(
      new InvalidUuidError()
    );
  });

  it("should throws an error when entity not found", async () => {
    const categoryId = new Uuid();
    await expect(
      useCase.execute({ id: categoryId.toString() })
    ).rejects.toThrow(new NotFoundError(categoryId.toString(), Category));
  });

  it("should delete a category", async () => {
    const category = new Category({ name: "some name" });
    repository.items.push(category);

    await useCase.execute({ id: category.id.toString() });

    expect(repository.items).toHaveLength(0);
  });
});
