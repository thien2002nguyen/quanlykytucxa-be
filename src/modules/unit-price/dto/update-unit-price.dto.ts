import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUnitPriceDto {
  @ApiProperty({
    description: 'Tiêu đề của đơn giá',
    example: 'Giá thuê phòng',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mô tả của đơn giá',
    example: 'Mô tả chi tiết về đơn giá thuê phòng.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Nội dung của đơn giá',
    example: 'Đơn giá thuê phòng theo tháng, diện tích, số người ở.',
  })
  @IsString()
  content: string;
}
