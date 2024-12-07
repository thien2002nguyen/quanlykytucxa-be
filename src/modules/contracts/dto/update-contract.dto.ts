import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsMongoId,
  IsObject,
} from 'class-validator';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';
import { StatusEnum } from 'src/modules/contracts/interfaces/contracts.interface';
import { CreateContractDto } from './create-contract.dto';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @ApiPropertyOptional({
    description: 'Mã sinh viên của hợp đồng',
    example: 'SV12345',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiPropertyOptional({
    description: 'Thông tin phòng thuê',
    example: {
      roomId: '507f1f77bcf86cd799439011',
      price: 2000000,
    },
  })
  @IsOptional()
  @IsObject()
  room?: {
    roomId: string;
    price: number;
  };

  @ApiPropertyOptional({
    description: 'Dịch vụ liên quan đến hợp đồng',
    type: [Object],
    example: [
      {
        serviceId: '507f1f77bcf86cd799439012',
        name: 'Dịch vụ dọn vệ sinh',
        price: 50000,
        status: StatusEnum.PENDING,
        confirmedAt: '2024-11-25T10:00:00',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  service?: {
    serviceId: string;
    name: string;
    price: number;
    status: StatusEnum;
    confirmedAt: string;
  }[];

  @ApiPropertyOptional({
    description: 'Điều khoản hợp đồng',
    type: [Object],
    example: [
      {
        termId: '507f1f77bcf86cd799439013',
        content: 'Điều khoản thanh toán theo tháng',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  term?: {
    termId: string;
    content: string;
  }[];

  @ApiPropertyOptional({
    description: 'Thông tin loại hợp đồng',
    example: {
      contractTypeId: '507f1f77bcf86cd799439014',
      duration: 12,
      unit: 'MONTH',
    },
  })
  @IsOptional()
  @IsObject()
  contractType?: {
    contractTypeId: string;
    duration: number;
    unit: TimeUnitEnum;
  };

  @ApiPropertyOptional({
    description: 'ID của người quản trị tạo hợp đồng',
    example: '507f1f77bcf86cd799439015',
  })
  @IsOptional()
  @IsMongoId()
  adminId?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái của hợp đồng',
    example: StatusEnum.PENDING,
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;
}
