import { IUseCase } from '@core/@shared/application/use-case.interface';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { CastMemberId } from '@core/cast-member/domain/cast-member-id.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/cast-member-type.vo';
import { Notification } from '@core/@shared/domain/notification';

export type UpdateCastMemberInput = {
  id: string;
  name?: string;
  type?: CastMemberTypes;
};

export type UpdateCastMemberOutput = CastMemberOutput;

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<CastMemberOutput> {
    const notification = new Notification();

    const castMemberId = new CastMemberId(input.id);
    const castMember = await this.castMemberRepository.findById(castMemberId);

    if (!castMember) {
      throw new NotFoundError(castMemberId, CastMember);
    }

    if (input?.name) {
      castMember.changeName(input.name);
      notification.copyErrors(castMember.notification);
    }

    if ('type' in input && input.type !== undefined) {
      try {
        const type = CastMemberType.create(input.type);
        castMember.changeType(type);
      } catch (e) {
        notification.addError(e.message, 'type');
      }
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.castMemberRepository.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}
