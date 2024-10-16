import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from 'src/schemas/student.schema';
import { verifyAdminToken } from 'src/utils/tokenUtils';

@Injectable()
export class StudentAuthGuard implements CanActivate {
  constructor(
    @InjectModel('Student') private readonly studentModel: Model<Student>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Không có token.');
    }

    const payload = verifyAdminToken(token);
    if (!payload) {
      throw new UnauthorizedException('Token không hợp lệ.');
    }

    // Tìm trong bảng student trực tiếp từ database (MongoDB)
    const student = await this.studentModel
      .findById(payload.id)
      .select('-password -refreshToken');
    if (!student) {
      throw new UnauthorizedException('Sinh viên không tồn tại.');
    }

    // Đính kèm thông tin sinh viên vào request để sử dụng trong controller nếu cần
    request.student = student;

    return true;
  }
}
