import { IsInt, IsString } from 'class-validator';
import { CreateCastMemberInput } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';

export class CreateCastMemberDto implements CreateCastMemberInput {
  @IsString()
  name: string;

  @IsInt()
  type: CastMemberTypes;
}
