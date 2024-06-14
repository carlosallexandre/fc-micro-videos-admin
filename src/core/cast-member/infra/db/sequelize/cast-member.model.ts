import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

export type CastMemberModelProps = {
  id: string;
  name: string;
  type: CastMemberTypes;
  created_at: Date;
};

@Table({ tableName: 'cast_members', timestamps: false })
export class CastMemberModel extends Model<CastMemberModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID() })
  declare id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare type: CastMemberTypes;

  @Column({ allowNull: false, type: DataType.DATE(3) })
  declare created_at: Date;
}
