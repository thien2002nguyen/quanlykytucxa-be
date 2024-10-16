import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginStudentDto {
  @ApiProperty({
    description: 'Mã số sinh viên',
    example: 'S12345',
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
