import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateIncidentDto } from './create-incident.dto';
import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { IncidentStatus } from 'src/modules/incidents/interfaces/incident.interface';

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {
  @ApiPropertyOptional({
    description: 'Mô tả sự cố',
    example: 'Điều hòa không hoạt động',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ảnh minh họa sự cố',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Trạng thái sự cố',
    example: 'resolved',
    enum: IncidentStatus,
  })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
