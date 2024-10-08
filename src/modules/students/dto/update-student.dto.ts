import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ description: 'Mã sinh viên', example: 'S12345' })
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Số căn cước công dân',
    example: '123456789',
  })
  nationalIdCard: string;

  @ApiPropertyOptional({ description: 'Họ và tên', example: 'Nguyễn Văn A' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh',
    example: '2000-01-01T00:00:00.000Z',
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Giới tính', example: 'Nam' })
  gender?: string;

  @ApiPropertyOptional({ description: 'Lớp học', example: 'Lớp A' })
  class?: string;

  @ApiPropertyOptional({ description: 'Khoa', example: 'Khoa Khoa học' })
  faculty?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '+1234567890' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'sinhvien@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ liên hệ',
    example: '123 Đường Chính, Thành phố',
  })
  contactAddress?: string;

  @ApiPropertyOptional({
    description: 'Khóa học',
    example: '2024',
  })
  course?: string;

  @ApiPropertyOptional({ description: 'Phòng học', example: '101' })
  roomId?: string;
}
