import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomTypeDto } from './create-room-type.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRoomTypeDto extends PartialType(CreateRoomTypeDto) {
  @ApiPropertyOptional({
    description: 'Tên loại phòng',
    example: 'Phòng đơn',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Giá loại phòng',
    example: 150000,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}
