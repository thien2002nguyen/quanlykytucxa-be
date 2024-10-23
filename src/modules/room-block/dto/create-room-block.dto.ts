import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomBlockDto {
  @ApiProperty({
    description: 'Tên khối phòng',
    example: 'Khối A',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
