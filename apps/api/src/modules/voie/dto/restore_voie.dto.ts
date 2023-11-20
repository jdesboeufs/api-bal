import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';

export class RestoreVoieDTO {
  @IsMongoId({ each: true })
  @ApiProperty({ required: true, nullable: true, isArray: true })
  numerosIds?: Types.ObjectId[];
}
