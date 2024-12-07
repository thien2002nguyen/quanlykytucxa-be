import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateContractTermDto } from './create-contract-terms.dto';

export class UpdateContractTermDto extends PartialType(CreateContractTermDto) {
  @ApiPropertyOptional({
    description: 'Nội dung điều khoản',
    example: 'Nội dung điều khoản đã được chỉnh sửa.',
  })
  @IsOptional()
  @IsString()
  content?: string;
}
