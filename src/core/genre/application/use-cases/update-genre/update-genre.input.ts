import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateGenreInput {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categories_id?: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
