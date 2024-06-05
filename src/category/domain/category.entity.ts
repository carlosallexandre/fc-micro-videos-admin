import { Entity } from "../../@shared/domain/entity";
import { EntityValidationError } from "../../@shared/domain/validators/validation.error";
import { Uuid } from "../../@shared/domain/value-objects/uuid.vo";
import { CategoryFakeBuilder } from "./category-fake.builder";
import { CategoryValidatorFactory } from "./category.validator";

export interface CategoryConstructorProps {
  category_id?: Uuid;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: Date;
}

export interface CategoryCreateCommand {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export class Category extends Entity {
  category_id: Uuid;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    super();

    this.category_id = props.category_id ?? new Uuid();
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  get id() {
    return this.category_id;
  }

  static create(props: CategoryCreateCommand): Category {
    const category = new Category(props);
    category.validate(["name"]);
    return category;
  }

  validate(fields?: string[]) {
    const validator = CategoryValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return CategoryFakeBuilder;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(["name"]);
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }

  toJSON() {
    return {
      id: this.category_id.value,
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
