import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Họ và tên',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Email',
    example: 'admin@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'Password123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
