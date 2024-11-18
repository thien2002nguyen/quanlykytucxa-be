import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { RoleAuth } from '../interfaces/user.interface';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @ApiPropertyOptional({
    description: 'Họ và tên',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'admin@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Mật khẩu',
    example: 'Password123!',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Ảnh đại diện',
    example: 'image.png',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Quyền truy cập',
    example: RoleAuth.STUDENT,
    enum: RoleAuth, // Cung cấp enum cho Swagger
  })
  @IsOptional()
  @IsEnum(RoleAuth) // Sử dụng IsEnum để validate role
  role?: RoleAuth;
}
