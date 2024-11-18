import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Lấy lại access token',
    example: 'string',
  })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;
}
