import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email',
    example: 'nguyencanhthien785@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mã số sinh viên',
    example: '2051220003',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiProperty({
    description: 'OTP',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
