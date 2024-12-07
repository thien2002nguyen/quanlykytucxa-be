import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleItemDto } from './schedule-item.dto'; // Import kiểu ScheduleItemDto

export class CreateServiceDto {
  @ApiProperty({
    description: 'Tên dịch vụ',
    example: 'Dịch vụ giặt ủi',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Giá dịch vụ',
    example: 100000,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Lịch trình của dịch vụ (ngày và giờ)',
    type: [ScheduleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedule: ScheduleItemDto[];
}
