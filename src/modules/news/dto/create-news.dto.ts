import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({
    description: 'Tiêu đề của bài viết',
    example: 'Tin tức nổi bật trong ngày',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mô tả ngắn gọn về bài viết',
    example: 'Bản tin cập nhật tình hình ký túc xá.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Nội dung chính của bài viết',
    example: '<p>Nội dung chi tiết về tình hình ký túc xá...</p>',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Hình ảnh đại diện của bài viết',
    example: 'https://example.com/image.jpg',
  })
  @IsNotEmpty()
  @IsUrl()
  image: string;
}
