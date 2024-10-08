import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ description: 'Mã sinh viên', example: 'S12345' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Số căn cước công dân',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  nationalIdCard?: string;

  @ApiPropertyOptional({ description: 'Họ và tên', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh',
    example: '2000-01-01T00:00:00.000Z',
  })
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Giới tính', example: 'Nam' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Lớp học', example: 'Lớp A' })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiPropertyOptional({ description: 'Khoa', example: 'Khoa Khoa học' })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email',
    example: 'sinhvien@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ liên hệ',
    example: '123 Đường Chính, Thành phố',
  })
  @IsOptional()
  @IsString()
  contactAddress?: string;

  @ApiPropertyOptional({
    description: 'Khóa học',
    example: '2024',
  })
  @IsOptional()
  @IsString()
  course?: string;

  @ApiPropertyOptional({
    description: 'ID phòng của sinh viên',
    example: '64b6f0c4f62e8b1f12345678',
  })
  @IsOptional()
  @IsMongoId()
  roomId?: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Ảnh đại diện của sinh viên',
    example: 'image.png',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
