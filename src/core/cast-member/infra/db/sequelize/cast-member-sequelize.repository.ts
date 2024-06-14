import { SearchParams } from '@core/@shared/domain/repository/search-params';
import { SearchResult } from '@core/@shared/domain/repository/search-result';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import {
  CastMemberFilter,
  CastMemberSearchParams,
} from '@core/cast-member/domain/cast-member-search-params.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberModel } from './cast-member.model';
import { CastMemberMapper } from './cast-member.mapper';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { CastMemberSearchResult } from '@core/cast-member/domain/cast-member-search-result.vo';
import { Order, WhereOptions, literal } from 'sequelize';
import { Op } from 'sequelize';

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    await this.castMemberModel.create(CastMemberMapper.toModel(entity));
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    await this.castMemberModel.bulkCreate(
      entities.map(CastMemberMapper.toModel),
    );
  }

  async update(entity: CastMember): Promise<void> {
    const model = await this.castMemberModel.findByPk(entity.id.toString());
    if (!model) throw new NotFoundError(entity.id, CastMember);

    await this.castMemberModel.update(CastMemberMapper.toModel(entity), {
      where: { id: entity.id.toString() },
    });
  }

  async delete(entity_id: CastMemberId): Promise<void> {
    const model = await this.castMemberModel.findByPk(entity_id.toString());
    if (!model) throw new NotFoundError(entity_id, CastMember);

    await this.castMemberModel.destroy({ where: { id: entity_id.toString() } });
  }

  async findById(entity_id: CastMemberId): Promise<CastMember | null> {
    const model = await this.castMemberModel.findByPk(entity_id.toString());
    return model ? CastMemberMapper.toDomain(model) : null;
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map(CastMemberMapper.toDomain);
  }

  async search(
    params: CastMemberSearchParams,
  ): Promise<CastMemberSearchResult> {
    const { rows: models, count: total } =
      await this.castMemberModel.findAndCountAll({
        where: this.formatFilter(params),
        order: this.formatSort(params),
        offset: (params.page - 1) * params.per_page,
        limit: params.per_page,
      });

    return CastMemberSearchResult.create({
      total,
      current_page: params.page,
      per_page: params.per_page,
      items: models.map(CastMemberMapper.toDomain),
    });
  }

  private formatFilter(
    params: CastMemberSearchParams,
  ): WhereOptions<CastMemberModel> {
    const { name, type } = params.filter;

    const where = {
      ...(name && { name: { [Op.like]: `%${name}%` } }),
      ...(type && { type: type.value }),
    };

    return Object.keys(where).length > 0 ? where : undefined;
  }

  private formatSort(params: CastMemberSearchParams): Order {
    const sort = params.sort;
    const sort_dir = params.sort_dir;
    const dialect = this.castMemberModel.sequelize.getDialect();

    if (dialect === 'mysql' && sort === 'name') {
      return literal(`binary name ${sort_dir}`);
    }

    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
