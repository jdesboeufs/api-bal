import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export class GlobalEntity {
  @ApiProperty()
  @PrimaryColumn('varchar', { length: 32 })
  id?: string;

  @ApiProperty()
  @Column('uuid', { name: 'ban_id', nullable: false })
  banId: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @ApiProperty()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @BeforeInsert()
  generatedObjectId?() {
    this.id = new ObjectId().toHexString();
  }
}
