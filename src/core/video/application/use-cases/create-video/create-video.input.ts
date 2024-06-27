import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsArray,
  IsUUID,
  Min,
  IsInt,
  validateSync,
} from 'class-validator';
import { RatingValues } from '../../../domain/rating.vo';

export type CreateVideoInputConstructorProps = {
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: RatingValues;
  is_opened: boolean;
  categories_id: string[];
  genres_id: string[];
  cast_members_id: string[];
  is_active?: boolean;
};

export class CreateVideoInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1900)
  @IsInt()
  @IsNotEmpty()
  year_launched: number;

  @Min(1)
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  rating: RatingValues;

  @IsBoolean()
  @IsNotEmpty()
  is_opened: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categories_id: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  genres_id: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  cast_members_id: string[];

  constructor(props?: CreateVideoInputConstructorProps) {
    Object.assign(this, props ?? {});
  }
}
