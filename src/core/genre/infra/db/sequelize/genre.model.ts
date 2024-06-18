import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreCategoryModel } from './genre-category.model';

export type GenreModelProps = {
  id: string;
  name: string;
  is_active: boolean;
  categories_id: GenreCategoryModel[];
  categories: CategoryModel;
  created_at: Date;
};

@Table({ tableName: 'genres', timestamps: false })
export class GenreModel extends Model<GenreModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare is_active: boolean;

  @HasMany(() => GenreCategoryModel)
  declare categories_id: GenreCategoryModel[];

  @BelongsToMany(() => CategoryModel, () => GenreCategoryModel)
  declare categories: CategoryModel;

  @Column({ allowNull: false, type: DataType.DATE(6) })
  declare created_at: Date;
}
