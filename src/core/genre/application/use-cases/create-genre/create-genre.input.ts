import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateGenreInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categories_id: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  constructor(
    props: {
      name?: string;
      categories_id?: string[];
      is_active?: boolean;
    } = {},
  ) {
    Object.assign(this, props);
  }
}
