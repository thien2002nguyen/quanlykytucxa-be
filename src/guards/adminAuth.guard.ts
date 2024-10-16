import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleAdmin } from 'src/modules/admin/interfaces/admin.interface';
import { Admin } from 'src/schemas/admin.schema';
import { verifyAdminToken } from 'src/utils/tokenUtils';

@Injectable()
export class AuthAdminGuard implements CanActivate {
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
      throw new UnauthorizedException('Quản trị viên không tồn tại.');
    }

    // Kiểm tra vai trò trong token có phải là 'moderator' hay không
    if (payload.role !== RoleAdmin.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền truy cập.');
    }

    // Kiểm tra vai trò trong database
    if (auth.role !== RoleAdmin.ADMIN) {
      throw new ForbiddenException('Vai trò không hợp lệ.');
    }

    // Đính kèm thông tin admin vào request để sử dụng trong controller nếu cần
    request.auth = auth;

    return true;
  }
}
