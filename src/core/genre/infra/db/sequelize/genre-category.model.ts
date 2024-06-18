import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from './genre.model';

export type GenreCategoryModelProps = {
  genre_id: string;
  category_id: string;
};

@Table({ tableName: 'genre_category', timestamps: false })
export class GenreCategoryModel extends Model<GenreCategoryModelProps> {
  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ type: DataType.UUID })
  declare genre_id: string;

  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ type: DataType.UUID })
  declare category_id: string;
}
