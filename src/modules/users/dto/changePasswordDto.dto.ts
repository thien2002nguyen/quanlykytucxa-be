import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'OTP Xác thực',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  otpAccessToken: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'student@123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
