import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateModeratorDto {
  @ApiProperty({
    description: 'Tên đăng nhập',
    example: 'moderator',
  })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'Email',
    example: 'moderator@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '+123456789',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'moderator@123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Ảnh đại diện',
    example: 'avatar.png',
  })
  @IsNotEmpty()
  @IsString()
  avatar: string;
}
