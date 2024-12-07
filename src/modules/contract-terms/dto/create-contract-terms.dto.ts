import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContractTermDto {
  @ApiProperty({
    description: 'Nội dung điều khoản',
    example: 'Đây là nội dung điều khoản.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
