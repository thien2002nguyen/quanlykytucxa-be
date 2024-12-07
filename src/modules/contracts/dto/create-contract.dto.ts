import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';
import { StatusEnum } from 'src/modules/contracts/interfaces/contracts.interface';

export class CreateContractDto {
  @ApiProperty({
    description: 'Mã sinh viên của hợp đồng',
    example: 'SV12345',
  })
  @IsNotEmpty()
  @IsString()
  studentCode: string;
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
    roomId: string;
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
    serviceId: string;
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
    termId: string;
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

  @ApiProperty({
    description: 'Trạng thái của hợp đồng',
    example: StatusEnum.PENDING,
  })
  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
