import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateIntroductionDto {
  @ApiProperty({
    description: 'Tiêu đề',
    example: 'Giới Thiệu Ký Túc Xá Đại Học',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mô tả',
    example: 'Thông tin về ký túc xá tại trường đại học.',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL youtube',
    example: 'https://www.youtube.com/embed/0wSjPqyHj6o?si=SXZfeaNsWFYydwIa',
  })
  @IsString()
  youtubeUrl: string;

  @ApiProperty({
    description: 'Nội dung',
    example: 'Nội dung chi tiết của phần giới thiệu.',
  })
  @IsString()
  content?: string;
}
