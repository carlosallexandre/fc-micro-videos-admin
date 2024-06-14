import { UpdateCastMemberInput } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { IsInt, IsString } from 'class-validator';

export class UpdateCastMemberDto implements Omit<UpdateCastMemberInput, 'id'> {
  @IsString()
  name?: string;

  @IsInt()
  type?: number;
}
