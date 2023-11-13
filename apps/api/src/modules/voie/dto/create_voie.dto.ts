import { ApiProperty } from '@nestjs/swagger';
import { ValidatorBal } from '@/shared/validators/validator_bal.validator';
import { Type } from 'class-transformer';
import {
  Validate,
  IsOptional,
  ValidateNested,
  IsNotEmptyObject,
  IsEnum,
} from 'class-validator';

import { LineString } from '@/shared/schemas/geometry/line_string.schema';
import { TypeNumerotationEnum } from '@/shared/schemas/voie/type_numerotation.enum';

export class CreateVoieDto {
  @Validate(ValidatorBal, ['voie_nom'])
  @ApiProperty({ required: true, nullable: false })
  nom: string;

  @IsOptional()
  @IsNotEmptyObject()
  @Validate(ValidatorBal, ['nom_alt_voie'])
  @ApiProperty({ required: false, nullable: true })
  nomAlt: Record<string, string>;

  @IsOptional()
  @IsEnum(TypeNumerotationEnum)
  @ApiProperty({ required: false, nullable: false })
  typeNumerotation: TypeNumerotationEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => LineString)
  @ApiProperty({
    type: () => LineString,
    required: false,
    nullable: false,
  })
  trace: LineString;
}
