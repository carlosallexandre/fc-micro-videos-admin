import { Op } from "sequelize";
import { NotFoundError } from "../../../../@shared/domain/errors/not-found.error";
import { SearchParams } from "../../../../@shared/domain/repository/search-params";
import { SearchResult } from "../../../../@shared/domain/repository/search-result";
import { Uuid } from "../../../../@shared/domain/value-objects/uuid.vo";
import { Category } from "../../../domain/category.entity";
import { ICategoryRepository } from "../../../domain/category.repository";
import { CategoryModel } from "./category.model";
import { CategoryMapper } from "./category.mapper";

export class CategorySequelizeRepository implements ICategoryRepository {
  constructor(private categoryModel: typeof CategoryModel) {}

  async search(props: SearchParams): Promise<SearchResult<Category>> {
    const { count, rows: models } = await this.categoryModel.findAndCountAll({
      where: props.filter
        ? { name: { [Op.like]: `%${props.filter}%` } }
        : undefined,
      order: props.sort
        ? [[props.sort, props.sort_dir]]
        : [["created_at", "desc"]],
      offset: (props.page - 1) * props.per_page,
      limit: props.per_page,
    });

    return new SearchResult({
      items: models.map(CategoryMapper.toEntity),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create(CategoryMapper.toModel(entity).toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(
      entities.map((e) => CategoryMapper.toModel(e).toJSON())
    );
  }

  async update(entity: Category): Promise<void> {
    const model = await this.categoryModel.findByPk(entity.id.toString());
    if (!model) throw new NotFoundError(entity.id.toString(), this.getEntity());
    await this.categoryModel.update(CategoryMapper.toModel(entity).toJSON(), {
      where: { id: entity.id.toString() },
    });
  }

  async delete(entity_id: Uuid): Promise<void> {
    const model = await this.categoryModel.findByPk(entity_id.toString());
    if (!model) throw new NotFoundError(entity_id.toString(), this.getEntity());
    await this.categoryModel.destroy({ where: { id: entity_id.toString() } });
  }

  async findById(entity_id: Uuid): Promise<Category | null> {
    return this.categoryModel
      .findByPk(entity_id.toString())
      .then((model) => (model ? CategoryMapper.toEntity(model) : null));
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .findAll()
      .then((models) => models.map(CategoryMapper.toEntity));
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
