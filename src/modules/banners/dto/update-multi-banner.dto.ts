import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsMongoId } from 'class-validator';

export class UpdateBannersStatusDto {
  @ApiProperty({
    description: 'Danh sách ID của các banner cần thay đổi trạng thái',
    example: ['60c72b2f5f1b2c001c8e4c36', '60c72b2f5f1b2c001c8e4c37'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bannerIds: string[];

  @ApiProperty({
    description: 'Trạng thái mới của các banner',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
