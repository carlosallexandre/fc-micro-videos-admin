import { Transform } from 'class-transformer';
import { CastMemberOutput } from '@core/cast-member/application/use-cases/common/cast-member.output';
import { ListCastMembersOutput } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { CollectionPresenter } from '../shared-module/collection.presenter';

export class CastMemberPresenter {
  id: string;

  name: string;

  type: number;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(props: CastMemberOutput) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((i) => new CastMemberPresenter(i));
  }
}
