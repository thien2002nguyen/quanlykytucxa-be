import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsEmail,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateContractDto {
  @ApiProperty({ description: 'Họ tên sinh viên', example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Mã sinh viên của hợp đồng',
    example: 'SV12345',
  })
  @IsNotEmpty()
  @IsString()
  studentCode: string;

  @ApiProperty({
    description: 'Email',
    example: 'nguyencanhthien785@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Mã phòng thuê',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  roomId: Types.ObjectId;

  @ApiProperty({
    description: 'Mã các dịch vụ',
    type: [Object],
    example: [
      {
        serviceId: '507f1f77bcf86cd799439012',
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  services: {
    serviceId: Types.ObjectId;
  }[];

  @ApiProperty({
    description: 'Mã loại hợp đồng',
    example: '507f1f77bcf86cd799439014',
  })
  @IsNotEmpty()
  @IsMongoId()
  contractTypeId: Types.ObjectId;
}
