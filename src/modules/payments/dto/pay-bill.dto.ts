import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { PaymentMethodEnum } from '../interfaces/payments.interface';

export class PayBillDto {
  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: PaymentMethodEnum.CASH,
    enum: PaymentMethodEnum,
  })
  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  paymentMethod: PaymentMethodEnum;

  @ApiProperty({
    description: 'Số tiền thanh toán',
    example: 500000,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
