import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleAuth, User } from 'src/modules/users/interfaces/user.interface';
import { verifyToken } from 'src/utils/token.utils';

@Injectable()
export class AuthModeratorOrAdminGuard implements CanActivate {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

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

    const auth = await this.userModel
      .findById(payload.id)
      .select('-password -refreshToken');
    if (!auth) {
      throw new UnauthorizedException('Tài khoản không tồn tại.');
    }

    if (auth.isBlocked) {
      throw new UnauthorizedException('Tài khoản đã bị khóa.');
    }

    // Kiểm tra vai trò trong token
    if (payload.role === RoleAuth.STUDENT) {
      throw new ForbiddenException('Bạn không có quyền truy cập.');
    }

    // Kiểm tra vai trò trong database
    if (auth.role === RoleAuth.STUDENT) {
      throw new ForbiddenException('Vai trò không hợp lệ.');
    }

    request.auth = auth;

    return true;
  }
}
