import { IUseCase } from '@core/@shared/application/use-case.interface';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';

export type GetCastMemberInput = { id: string };

export type GetCastMemberOutput = CastMemberOutput;

export class GetCastMemberUseCase
  implements IUseCase<GetCastMemberInput, GetCastMemberOutput>
{
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: GetCastMemberInput): Promise<CastMemberOutput> {
    const castMemberId = new CastMemberId(input.id);

    const castMember = await this.castMemberRepository.findById(castMemberId);

    if (!castMember) {
      throw new NotFoundError(castMemberId, CastMember);
    }

    return CastMemberOutputMapper.toOutput(castMember);
  }
}
