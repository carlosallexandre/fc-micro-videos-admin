import { IUseCase } from '@core/@shared/application/use-case.interface';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { EntityValidationError } from '@core/@shared/domain/errors/validation.error';
import { Notification } from '@core/@shared/domain/notification';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';

export type CreateCastMemberInput = {
  name: string;
  type: number;
};

export type CreateCastMemberOutput = CastMemberOutput;

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const notification = new Notification();
    let castMemberType = null;

    try {
      castMemberType = CastMemberType.create(input.type);
    } catch (e) {
      notification.addError(e?.message, 'type');
    }

    const castMember = CastMember.create({
      name: input.name,
      type: castMemberType,
    });

    notification.copyErrors(castMember.notification);

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.castMemberRepository.insert(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}
