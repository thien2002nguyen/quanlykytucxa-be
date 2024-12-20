import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordByUserDto {
  @ApiProperty({
    description: 'Mật khẩu cũ',
    example: 'student@123',
  })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'student@123',
  })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
