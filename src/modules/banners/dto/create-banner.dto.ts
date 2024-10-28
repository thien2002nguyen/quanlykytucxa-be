import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({
    description: 'URL của banner',
    example: 'banner.jpg',
  })
  @IsNotEmpty()
  @IsString()
  url: string;
}
