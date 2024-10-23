import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty({
    description: 'Loại phòng',
    example: 'Phòng đơn',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Giá phòng',
    example: 150000,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;
}
