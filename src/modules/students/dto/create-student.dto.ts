import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { GenderEnum } from '../interfaces/students.interface';

export class CreateStudentDto {
  @ApiProperty({
    description: 'ID người dùng',
    example: '64b6f0c4f62e8b1f12345678',
  })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiProperty({ description: 'Mã sinh viên', example: 'S12345' })
  @IsNotEmpty()
  @IsString()
  studentCode: string;

  @ApiProperty({ description: 'Số căn cước công dân', example: '123456789' })
  @IsNotEmpty()
  @IsString()
  nationalIdCard: string;

  @ApiProperty({ description: 'Họ tên sinh viên', example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Ngày sinh của sinh viên',
    example: '2000-01-01',
  })
  @IsNotEmpty()
  @IsString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Giới tính của sinh viên',
    example: GenderEnum.nam,
    enum: GenderEnum,
  })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @ApiProperty({ description: 'Lớp học của sinh viên', example: 'Lớp 10A1' })
  @IsNotEmpty()
  @IsString()
  takeClass: string;

  @ApiProperty({
    description: 'Khoa của sinh viên',
    example: 'Công nghệ thông tin',
  })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({
    description: 'Địa chỉ của sinh viên',
    example: '123 Đường ABC, Quận XYZ, Thành phố',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Năm tuyển sinh',
    example: '2023',
  })
  @IsNotEmpty()
  @IsString()
  enrollmentYear: string;
}
