import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class DeviceItemDto {
  @ApiProperty({
    description: 'Tên thiết bị (ví dụ: Điều hòa, TV)',
    example: 'Điều hòa',
  })
  @IsString()
  deviceName: string;

  @ApiProperty({
    description: 'Số lượng thiết bị',
    example: 2,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description:
      'Trạng thái của thiết bị (true: hoạt động, false: không hoạt động)',
    example: true,
  })
  @IsBoolean()
  status: boolean;
}
