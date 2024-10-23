import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @ApiPropertyOptional({
    description: 'Tên phòng',
    example: 'Phòng 101',
  })
  @IsOptional()
  @IsString()
  roomName?: string;

  @IsOptional()
  @IsString()
  roomSlug?: string;

  @ApiPropertyOptional({
    description: 'Mô tả phòng',
    example: 'Phòng đơn, có điều hòa',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Sức chứa tối đa',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  maximumCapacity?: number;

  @ApiPropertyOptional({
    description: 'Tầng',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiPropertyOptional({
    description: 'ID của khối phòng',
    example: '60c72b2f5f1b2c001c8e4c36',
  })
  @IsOptional()
  @IsMongoId()
  roomBlockId?: string;

  @ApiPropertyOptional({
    description: 'ID của loại phòng',
    example: '60c72b2f5f1b2c001c8e4c37',
  })
  @IsOptional()
  @IsMongoId()
  roomTypeId?: string;

  @ApiPropertyOptional({
    description: 'Ảnh đại diện của phòng',
    example: 'room-thumbnail.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ảnh của phòng',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
