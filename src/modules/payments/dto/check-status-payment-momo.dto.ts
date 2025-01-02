import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckStatusPaymentMomoDto {
  @ApiProperty({
    description: 'Mã giao dịch',
    example: 'MOMO1735215644948',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
