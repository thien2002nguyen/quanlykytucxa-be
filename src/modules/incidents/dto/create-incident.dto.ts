import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { IncidentStatus } from 'src/modules/incidents/interfaces/incident.interface';

export class CreateIncidentDto {
  @ApiProperty({
    description: 'Mô tả sự cố',
    example: 'Điều hòa không hoạt động',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Danh sách ảnh minh họa sự cố',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsNotEmpty()
  @IsArray()
  images: string[];

  @ApiProperty({
    description: 'Trạng thái sự cố',
    example: 'pending',
    enum: IncidentStatus,
  })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
