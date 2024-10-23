import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

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
}
