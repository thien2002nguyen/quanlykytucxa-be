import { PartialType } from '@nestjs/mapped-types';
import { CreateBannerDto } from './create-banner.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {
  @ApiPropertyOptional({
    description: 'URL của banner',
    example: 'banner.jpg',
  })
  @IsOptional()
  @IsString()
  url?: string;
}
