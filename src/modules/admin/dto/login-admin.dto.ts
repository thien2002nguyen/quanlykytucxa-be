import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({
    description: 'Email',
    example: 'admin@example.com',
  })
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'Password123!',
  })
  @IsNotEmpty()
  password: string;
}
