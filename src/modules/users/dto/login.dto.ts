import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'UserName, Email or PhoneNumber',
    example: 'admin@gmail.com',
  })
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'admin@123',
  })
  @IsNotEmpty()
  password: string;
}
