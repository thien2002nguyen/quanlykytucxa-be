import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ScheduleItemDto {
  @ApiProperty({
    description: 'Ngày trong tuần (ví dụ: Monday, Tuesday)',
    example: 'Monday',
  })
  @IsString()
  dayOfWeek: string;

  @ApiProperty({
    description: 'Thời gian (ví dụ: 9:00 AM, 2:30 PM)',
    example: '9:00 AM',
  })
  @IsString()
  time: string;
}
