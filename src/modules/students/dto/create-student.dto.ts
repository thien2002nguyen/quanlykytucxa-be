import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Mã sinh viên', example: 'S12345' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Số căn cước công dân', example: '123456789' })
  @IsNotEmpty()
  @IsString()
  nationalIdCard: string;

  @ApiProperty({
    description: 'Tên đầy đủ của sinh viên',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Ngày sinh của sinh viên',
    example: '2000-01-01T00:00:00Z',
  })
  @IsNotEmpty()
  @IsString()
  dateOfBirth: string;

  @ApiProperty({ description: 'Giới tính của sinh viên', example: 'Nam' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({ description: 'Lớp của sinh viên', example: 'Lớp A' })
  @IsNotEmpty()
  @IsString()
  class: string;

  @ApiProperty({ description: 'Khoa của sinh viên', example: 'Khoa Khoa học' })
  @IsNotEmpty()
  @IsString()
  faculty: string;

  @ApiProperty({
    description: 'Số điện thoại của sinh viên',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Email của sinh viên',
    example: 'sinhvien@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Địa chỉ liên hệ của sinh viên',
    example: '123 Đường Chính, Thành phố',
  })
  @IsNotEmpty()
  @IsString()
  contactAddress: string;

  @ApiProperty({
    description: 'Khóa học',
    example: '2024',
  })
  @IsNotEmpty()
  @IsString()
  course: string;

  @ApiProperty({ description: 'ID phòng của sinh viên', example: '101' })
  @IsNotEmpty()
  @IsString()
  roomId: string;
}
