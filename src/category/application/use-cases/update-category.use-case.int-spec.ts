import { randomUUID } from "node:crypto";
import { UpdateCategoryUseCase } from "./update-category.use-case";
import { NotFoundError } from "../../../@shared/domain/errors/not-found.error";
import { Uuid } from "../../../@shared/domain/value-objects/uuid.vo";
import { setupSequelize } from "../../../@shared/infra/testing/helpers";
import { Category } from "../../domain/category.entity";
import { CategoryModel } from "../../infra/db/sequelize/category.model";
import { CategorySequelizeRepository } from "../../infra/db/sequelize/category.repository";

describe("UpdateCategoryUseCase Integration Tests", () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  it("should throws an error when entity not found", async () => {
    const uuid = new Uuid();
    await expect(
      useCase.execute({ id: uuid.toString(), name: "fake" })
    ).rejects.toThrow(new NotFoundError(uuid.toString(), Category));
  });

  it("should update a category", async () => {
    const entity = Category.fake().aCategory().build();
    await repository.insert(entity);

    let output = await useCase.execute({
      id: entity.id.toString(),
      name: "test",
    });
    expect(output).toStrictEqual({
      id: entity.id.toString(),
      name: "test",
      description: entity.description,
      is_active: true,
      created_at: entity.created_at,
    });
  });

  it.each([
    {
      input: {
        id: randomUUID(),
        name: "test",
        description: "some description",
      },
      expected: {
        id: expect.any(String),
        name: "test",
        description: "some description",
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: randomUUID(),
        name: "test",
      },
      expected: {
        id: expect.any(String),
        name: "test",
        description: null,
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: randomUUID(),
        name: "test",
        is_active: false,
      },
      expected: {
        id: expect.any(String),
        name: "test",
        description: null,
        is_active: false,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: randomUUID(),
        name: "test",
      },
      expected: {
        id: expect.any(String),
        name: "test",
        description: null,
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: randomUUID(),
        name: "test",
        is_active: true,
      },
      expected: {
        id: expect.any(String),
        name: "test",
        description: null,
        is_active: true,
        created_at: expect.any(Date),
      },
    },
    {
      input: {
        id: randomUUID(),
        name: "test",
        description: "some description",
        is_active: false,
      },
      expected: {
        id: expect.any(String),
        name: "test",
        description: "some description",
        is_active: false,
        created_at: expect.any(Date),
      },
    },
  ])("should update when input is $input", async (i) => {
    // Arrange
    await repository.insert(
      new Category({ category_id: new Uuid(i.input.id), name: "some name" })
    );

    // Act
    const output = await useCase.execute({
      id: i.input.id,
      ...("name" in i.input && { name: i.input.name }),
      ...("description" in i.input && { description: i.input.description }),
      ...("is_active" in i.input && { is_active: i.input.is_active }),
    });

    // Assert
    expect(output).toStrictEqual(i.expected);
  });
});
