import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
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
  @IsNotEmpty()
  @IsString()
  studentCode: string;
}
