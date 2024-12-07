import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateInfomationDto {
  @ApiProperty({
    description: 'Tiêu đề của thông báo',
    example: 'Thông báo quan trọng về bảo trì hệ thống',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mô tả ngắn gọn về thông báo',
    example:
      'Dịch vụ sẽ bị gián đoạn trong khoảng thời gian từ 2 giờ đến 4 giờ.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Nội dung chính của thông báo',
    example: '<p>Thông báo chi tiết về bảo trì...</p>',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Hình ảnh đại diện của thông báo',
    example: 'https://example.com/infomation-image.jpg',
  })
  @IsNotEmpty()
  @IsUrl()
  image: string;
}
