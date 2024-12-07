import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { CreateContractTypeDto } from './create-contract-types.dto';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';

export class UpdateContractTypeDto extends PartialType(CreateContractTypeDto) {
  @ApiPropertyOptional({
    description: 'Tiêu đề loại hợp đồng',
    example: 'Hợp đồng theo tháng',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Thời gian hợp đồng',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Đơn vị thời gian',
    enum: TimeUnitEnum,
    example: TimeUnitEnum.MONTH,
  })
  @IsOptional()
  @IsEnum(TimeUnitEnum)
  unit?: TimeUnitEnum;
}
