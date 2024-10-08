import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schemas/admin.schema'; // Đảm bảo đúng đường dẫn
import { verifyToken } from 'src/utils/tokenUtils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Không có token.');
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('Token không hợp lệ.');
    }

    // Tìm admin trực tiếp từ database (MongoDB)
    const admin = await this.adminModel
      .findById(payload.id)
      .select('-password -refreshToken');
    if (!admin) {
      throw new UnauthorizedException('Quản trị viên không tồn tại.');
    }

    // Đính kèm thông tin admin vào request để sử dụng trong controller nếu cần
    request.admin = admin;

    return true;
  }
}
