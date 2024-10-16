import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schemas/admin.schema';
import { verifyAdminToken } from 'src/utils/tokenUtils';

@Injectable()
export class AuthModeratorOrAdminGuard implements CanActivate {
  constructor(
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
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

    // Tìm trong bảng admin trực tiếp từ database (MongoDB)
    const auth = await this.adminModel
      .findById(payload.id)
      .select('-password -refreshToken');
    if (!auth) {
      throw new UnauthorizedException('Người kiểm duyệt không tồn tại.');
    }

    // Đính kèm thông tin admin vào request để sử dụng trong controller nếu cần
    request.auth = auth;

    return true;
  }
}
