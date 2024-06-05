import { MaxLength } from "class-validator";
import { Category } from "./category.entity";
import { ClassValidatorFields } from "../../@shared/domain/validators/validator-fields";
import { Notification } from "../../@shared/domain/validators/notification";

class CategoryRules {
  @MaxLength(255, { groups: ["name"] })
  name: string;

  constructor(props: Pick<Category, "name" | "description" | "is_active">) {
    Object.assign(this, props);
  }
}

class CategoryValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields: string[]): boolean {
    const newFields = fields?.length ? fields : ["name"];
    return super.validate(notification, new CategoryRules(data), newFields);
  }
}

export class CategoryValidatorFactory {
  static create() {
    return new CategoryValidator();
  }
}
