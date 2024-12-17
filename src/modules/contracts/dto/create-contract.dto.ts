import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsObject,
  IsEmail,
} from 'class-validator';
import { Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';

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
    description: 'Thông tin phòng thuê',
    example: {
      roomId: '507f1f77bcf86cd799439011',
      price: 2000000,
    },
  })
  @IsNotEmpty()
  @IsObject()
  room: {
    roomId: Types.ObjectId;
    price: number;
  };

  @ApiProperty({
    description: 'Dịch vụ',
    type: [Object],
    example: [
      {
        serviceId: '507f1f77bcf86cd799439012',
        name: 'Dịch vụ dọn vệ sinh',
        price: 50000,
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  service: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
  }[];

  @ApiProperty({
    description: 'Điều khoản hợp đồng',
    type: [Object],
    example: [
      {
        termId: '507f1f77bcf86cd799439013',
        content: 'Điều khoản thanh toán theo tháng',
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  term: {
    termId: Types.ObjectId;
    content: string;
  }[];

  @ApiProperty({
    description: 'Thông tin loại hợp đồng',
    example: {
      contractTypeId: '507f1f77bcf86cd799439014',
      duration: 12,
      unit: TimeUnitEnum.MONTH,
    },
  })
  @IsNotEmpty()
  @IsObject()
  contractType: {
    contractTypeId: string;
    duration: number;
    unit: TimeUnitEnum;
  };
}
