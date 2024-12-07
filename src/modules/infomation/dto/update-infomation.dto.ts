import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateInfomationDto } from './create-infomation.dto';

export class UpdateInfomationDto extends PartialType(CreateInfomationDto) {
  @ApiPropertyOptional({
    description: 'Tiêu đề của thông báo',
    example: 'Thông báo quan trọng về bảo trì hệ thống',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả ngắn gọn về thông báo',
    example:
      'Dịch vụ sẽ bị gián đoạn trong khoảng thời gian từ 2 giờ đến 4 giờ.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nội dung chính của thông báo',
    example: '<p>Thông báo chi tiết về bảo trì...</p>',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Hình ảnh đại diện của thông báo',
    example: 'https://example.com/infomation-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Tình trạng của thông báo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
