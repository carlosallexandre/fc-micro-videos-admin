import { randomUUID } from "node:crypto";
import { DataType, Sequelize } from "sequelize-typescript";
import { CategoryModel } from "./category.model";
import { setupSequelize } from "../../../../@shared/infra/testing/helpers";

describe("CategoryModel Integration Tests", () => {
  setupSequelize({ models: [CategoryModel] });

  test("mapping props", async () => {
    const attributesMap = CategoryModel.getAttributes();
    const attributes = Object.keys(CategoryModel.getAttributes());

    expect(attributes).toStrictEqual([
      "id",
      "name",
      "description",
      "is_active",
      "created_at",
    ]);

    expect(attributesMap.id).toMatchObject({
      field: "id",
      fieldName: "id",
      primaryKey: true,
      type: DataType.UUID(),
    });

    expect(attributesMap.name).toMatchObject({
      field: "name",
      fieldName: "name",
      allowNull: false,
      type: DataType.STRING(255),
    });

    expect(attributesMap.description).toMatchObject({
      field: "description",
      fieldName: "description",
      allowNull: true,
      type: DataType.TEXT(),
    });

    expect(attributesMap.is_active).toMatchObject({
      field: "is_active",
      fieldName: "is_active",
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    expect(attributesMap.created_at).toMatchObject({
      field: "created_at",
      fieldName: "created_at",
      allowNull: false,
      type: DataType.DATE(3),
    });
  });

  test("create", async () => {
    // Arrange
    const arrange = {
      id: randomUUID(),
      name: "test",
      is_active: true,
      created_at: new Date(),
    };

    // Act
    const category = await CategoryModel.create(arrange);

    // Assert
    expect(category.toJSON()).toStrictEqual(arrange);
  });
});
