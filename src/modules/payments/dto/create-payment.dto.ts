import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Số tiền thanh toán (VND)',
    example: 400000,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Thông tin đơn hàng',
    example:
      '2051220003 - Nguyễn Cảnh Thiện - Thanh toán hóa đơn Momo - 400000 VNĐ',
  })
  @IsNotEmpty()
  @IsString()
  orderInfo: string;
}
