import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateServiceContractDto {
  @ApiProperty({
    description: 'Mã dịch vụ',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsNotEmpty()
  serviceId: Types.ObjectId;

  @ApiProperty({
    description: 'Tên dịch vụ',
    example: 'Dịch vụ dọn vệ sinh',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Giá dịch vụ',
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
