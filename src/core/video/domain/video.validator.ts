import { MaxLength } from 'class-validator';
import { ClassValidator } from '@core/@shared/domain/validators/class-validator.validator';
import { Video } from './video.aggregate';

export class VideoRules {
  @MaxLength(255, { groups: ['title'] })
  title: string;

  constructor(aggregate: Video) {
    Object.assign(this, aggregate);
  }
}

export class VideoValidator extends ClassValidator {
  validate(data: Video, ...fields: string[]) {
    const newFields = fields?.length ? fields : ['title'];
    return super.validate(new VideoRules(data), ...newFields);
  }
}

export class VideoValidatorFactory {
  static create() {
    return new VideoValidator();
  }
}

export default VideoValidatorFactory;
