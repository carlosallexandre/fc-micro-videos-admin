import { OmitType } from '@nestjs/mapped-types';
import { UpdateGenreInput } from '@core/genre/application/use-cases/update-genre/update-genre.input';

export class UpdateGenreDto extends OmitType(UpdateGenreInput, ['id']) {}
