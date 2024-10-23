import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Tên phòng',
    example: 'Phòng 101',
  })
  @IsNotEmpty()
  @IsString()
  roomName: string;

  @ApiProperty({
    description: 'Mô tả phòng',
    example: 'Phòng đơn, có điều hòa',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Sức chứa tối đa của phòng',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  maximumCapacity: number;

  @ApiProperty({
    description: 'Tầng của phòng',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  floor: number;

  @ApiProperty({
    description: 'ID của khối phòng',
    example: '60c72b2f5f1b2c001c8e4c36',
  })
  @IsNotEmpty()
  @IsMongoId()
  roomBlockId: string;

  @ApiProperty({
    description: 'ID của loại phòng',
    example: '60c72b2f5f1b2c001c8e4c37',
  })
  @IsNotEmpty()
  @IsMongoId()
  roomTypeId: string;

  @ApiProperty({
    description: 'Ảnh đại diện của phòng',
    example: 'image.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({
    description: 'Các ảnh khác của phòng',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
