import { Op, Order, literal } from 'sequelize';
import { NotFoundError } from '../../../../@shared/domain/errors/not-found.error';
import { SearchParams } from '../../../../@shared/domain/repository/search-params';
import { SearchResult } from '../../../../@shared/domain/repository/search-result';
import { Category } from '../../../domain/category.aggregate';
import { ICategoryRepository } from '../../../domain/category.repository';
import { CategoryModel } from './category.model';
import { CategoryMapper } from './category.mapper';
import { CategoryId } from '@core/category/domain/category-id.vo';

export class CategorySequelizeRepository implements ICategoryRepository {
  constructor(private categoryModel: typeof CategoryModel) {}

  async search(props: SearchParams): Promise<SearchResult<Category>> {
    const { count, rows: models } = await this.categoryModel.findAndCountAll({
      where: props.filter
        ? { name: { [Op.like]: `%${props.filter}%` } }
        : undefined,
      order: this.formatSort(props),
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

  private formatSort(params: SearchParams): Order {
    const sort = params.sort ?? 'created_at';
    const sort_dir = params.sort_dir ?? 'desc';
    const dialect = this.categoryModel.sequelize.getDialect();

    if (dialect === 'mysql' && sort === 'name') {
      return literal(`binary name ${sort_dir}`);
    }

    return [[sort, sort_dir]];
  }

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create(CategoryMapper.toModel(entity).toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(
      entities.map((e) => CategoryMapper.toModel(e).toJSON()),
    );
  }

  async update(entity: Category): Promise<void> {
    const model = await this.categoryModel.findByPk(entity.id.toString());
    if (!model) throw new NotFoundError(entity.id.toString(), this.getEntity());
    await this.categoryModel.update(CategoryMapper.toModel(entity).toJSON(), {
      where: { id: entity.id.toString() },
    });
  }

  async delete(category_id: CategoryId): Promise<void> {
    const model = await this.categoryModel.findByPk(category_id.toString());
    if (!model) throw new NotFoundError(category_id, this.getEntity());
    await this.categoryModel.destroy({ where: { id: category_id.toString() } });
  }

  async findById(category_id: CategoryId): Promise<Category | null> {
    return this.categoryModel
      .findByPk(category_id.toString())
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
