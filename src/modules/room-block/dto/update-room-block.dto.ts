import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateRoomBlockDto } from './create-room-block.dto';

export class UpdateRoomBlockDto extends PartialType(CreateRoomBlockDto) {
  @ApiPropertyOptional({
    description: 'Tên khối phòng',
    example: 'Khối A',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
