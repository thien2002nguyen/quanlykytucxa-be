import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ description: 'Mã sinh viên', example: 'S12345' })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiPropertyOptional({
    description: 'Số căn cước công dân',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  nationalIdCard?: string;

  @ApiPropertyOptional({
    description: 'Họ tên sinh viên',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh',
    example: '2000-01-01',
  })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Giới tính', example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Lớp học', example: 'Lớp 10A1' })
  @IsOptional()
  @IsString()
  takeClass?: string;

  @ApiPropertyOptional({
    description: 'Khoa',
    example: 'Công nghệ thông tin',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ',
    example: '123 Đường ABC, Quận XYZ, Thành phố',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Năm tuyển sinh',
    example: '2023',
  })
  @IsOptional()
  @IsString()
  enrollmentYear?: string;

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

  @ApiPropertyOptional({
    description: 'Tình trạng tài khoản',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
