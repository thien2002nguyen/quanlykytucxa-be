import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateNewsDto } from './create-news.dto';

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @ApiPropertyOptional({
    description: 'Tiêu đề của bài viết',
    example: 'Tin tức nổi bật trong ngày',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả ngắn gọn về bài viết',
    example: 'Bản tin cập nhật tình hình ký túc xá.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nội dung chính của bài viết',
    example: '<p>Nội dung chi tiết về tình hình ký túc xá...</p>',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Hình ảnh đại diện của bài viết',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Tình trạng bài viết',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
