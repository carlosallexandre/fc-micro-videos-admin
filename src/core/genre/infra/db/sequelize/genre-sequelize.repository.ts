import { SortDirection } from '@core/@shared/domain/repository/search-params';
import { GenreId } from '@core/genre/domain/genre-id.vo';
import { GenreSearchParams } from '@core/genre/domain/genre-search-params.vo';
import { GenreSearchResult } from '@core/genre/domain/genre-search-result.vo';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { Op, QueryTypes, literal } from 'sequelize';
import { GenreModelMapper } from './genre-model.mapper';
import { GenreModel } from './genre.model';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit-of-work-sequelize';

export class GenreSequelizeRepository implements IGenreRepository {
  constructor(
    private genreModel: typeof GenreModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Genre): Promise<void> {
    await this.genreModel.create(GenreModelMapper.toModelProps(entity), {
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = entities.map((e) => GenreModelMapper.toModelProps(e));
    await this.genreModel.bulkCreate(models, {
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(id: GenreId): Promise<Genre | null> {
    const model = await this._get(id.toString());
    return model ? GenreModelMapper.toDomain(model) : null;
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
    return models.map(GenreModelMapper.toDomain);
  }

  async update(aggregate: Genre): Promise<void> {
    const model = await this._get(aggregate.id.toString());

    if (!model) {
      throw new NotFoundError(aggregate.id, this.getEntity());
    }

    await model.$remove(
      'categories',
      model.categories_id.map((c) => c.category_id),
      { transaction: this.uow.getTransaction() },
    );
    const { categories_id, ...props } =
      GenreModelMapper.toModelProps(aggregate);
    await this.genreModel.update(props, {
      where: { id: aggregate.id.toString() },
      transaction: this.uow.getTransaction(),
    });
    await model.$add(
      'categories',
      categories_id.map((c) => c.category_id),
      { transaction: this.uow.getTransaction() },
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation =
      this.genreModel.associations.categories_id.target;
    await genreCategoryRelation.destroy({
      where: { genre_id: id.toString() },
      transaction: this.uow.getTransaction(),
    });
    const affectedRows = await this.genreModel.destroy({
      where: { id: id.toString() },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  private async _get(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      include: ['categories_id'],
      transaction: this.uow.getTransaction(),
    });
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const where = this.formatFilter(props);
    const orderBy = this.formatSort(props);
    const columnToOrder = orderBy.replace('binary', '').split(' ')[0];
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;

    const count = await this.genreModel.count({
      distinct: true,
      col: 'id',
      where: [...where.values()].map((w) => w.condition),
      include: where.has('categories_id') ? 'categories_id' : undefined,
      transaction: this.uow.getTransaction(),
    });

    const genreIds = await this.genreModel.sequelize.query<{
      id: string;
    }>(
      [
        `SELECT DISTINCT ${this.genreAlias}.\`id\`, ${columnToOrder}`,
        `FROM ${this.genreTableName} AS ${this.genreAlias}`,
        where.has('categories_id')
          ? `INNER JOIN ${this.genreCategoryTableName} AS ${this.genreCategoryAlias} ON ${this.genreAlias}.id = ${this.genreCategoryAlias}.genre_id`
          : undefined,
        where.size > 0
          ? `WHERE ${[...where.values()].map((w) => w.rawCondition).join(' AND ')}`
          : undefined,
        `ORDER BY ${orderBy}`,
        `LIMIT ${limit}`,
        `OFFSET ${offset}`,
      ]
        .filter(Boolean)
        .join(' '),
      {
        type: QueryTypes.SELECT,
        replacements: [...where.values()].reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.genreModel.findAll({
      where: { id: { [Op.in]: genreIds.map((g) => g.id) } },
      include: 'categories_id',
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new GenreSearchResult({
      items: models.map(GenreModelMapper.toDomain),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }

  private formatFilter(props: GenreSearchParams) {
    const map = new Map();
    const name = props.filter?.name;
    const categories_id = props.filter?.categories_id;

    if (name) {
      map.set('name', {
        field: 'name',
        value: `%${props.filter.name}%`,
        get condition() {
          return {
            [this.field]: {
              [Op.like]: this.value,
            },
          };
        },
        rawCondition: `${this.genreAlias}.name LIKE :name`,
      });
    }

    if (categories_id) {
      map.set('categories_id', {
        field: 'categories_id',
        value: props.filter.categories_id.map((c) => c.value),
        get condition() {
          return {
            ['$categories_id.category_id$']: {
              [Op.in]: this.value,
            },
          };
        },
        rawCondition: `${this.genreCategoryAlias}.category_id IN (:categories_id)`,
      });
    }

    return map;
  }

  private formatSort(props: GenreSearchParams): string {
    const SORTABLE_FIELDS = ['name', 'created_at'];

    const ORDER_BY = {
      mysql: {
        name: (sort_dir: SortDirection) =>
          `binary ${this.genreAlias}.\`name\` ${sort_dir}`,
      },
    };

    const isValidSort = props.sort && SORTABLE_FIELDS.includes(props.sort);
    const sort = isValidSort ? props.sort : 'created_at';
    const sort_dir = isValidSort ? props.sort_dir : 'DESC';

    const dialect = this.genreModel.sequelize.getDialect();

    if (ORDER_BY[dialect] && ORDER_BY[dialect][sort]) {
      return ORDER_BY[dialect][sort](sort_dir);
    }

    return `${this.genreAlias}.\`${sort}\` ${sort_dir}`;
  }

  private get genreAlias() {
    return this.genreModel.name;
  }

  private get genreTableName() {
    return this.genreModel.getTableName();
  }

  private get genreCategoryTableName() {
    return this.genreModel.associations['categories_id'].target.getTableName();
  }

  private get genreCategoryAlias() {
    return this.genreModel.associations['categories_id'].target.name;
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
