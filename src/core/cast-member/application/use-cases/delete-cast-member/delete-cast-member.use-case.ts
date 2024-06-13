import { IUseCase } from '@core/@shared/application/use-case.interface';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';

export type DeleteCastMemberInput = { id: string };

export type DeleteCastMemberOutput = void;

export class DeleteCastMemberUseCase
  implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput>
{
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<void> {
    const castMemberId = new CastMemberId(input.id);
    await this.castMemberRepository.delete(castMemberId);
  }
}
