import { OmitType } from '@nestjs/mapped-types';
import { UpdateVideoInput } from '@core/video/application/use-cases/update-video/update-video.input';

class UpdateVideoInputWithoutId extends OmitType(UpdateVideoInput, ['id']) {}

export class UpdateVideoDto extends UpdateVideoInputWithoutId {}
