import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsString } from 'class-validator';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';

export class CreateContractTypeDto {
  @ApiProperty({
    description: 'Tiêu đề loại hợp đồng',
    example: 'Hợp đồng theo năm',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Thời gian hợp đồng',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'Đơn vị thời gian',
    enum: TimeUnitEnum,
    example: TimeUnitEnum.YEAR,
  })
  @IsNotEmpty()
  @IsEnum(TimeUnitEnum)
  unit: TimeUnitEnum;
}
