import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { RoleAdmin } from '../interfaces/admin.interface';

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

  @ApiProperty({
    description: 'Ảnh đại diện của quản trị viên',
    example: 'image.png',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Vai trò của quản trị viên',
    example: RoleAdmin.MODERATOR,
    enum: RoleAdmin, // Cung cấp enum cho Swagger
  })
  @IsEnum(RoleAdmin) // Sử dụng IsEnum để validate role
  role: RoleAdmin;
}
