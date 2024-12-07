import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { RoleAuth } from 'src/modules/users/interfaces/user.interface';

const SECRET_KEY = process.env.SECRET_KEY || 'nguyen_canh_thien';
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '1d';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

interface TokenPayload {
  id: string;
  role?: RoleAuth;
}

/**
 * Sinh access token và refresh token
 * @param _id - ID của người dùng
 * @returns Một đối tượng chứa access token và refresh token
 */
export function generateAccessToken(id: string, role: RoleAuth) {
  const payload: TokenPayload = { id, role };

  const accessToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  // Sửa đoạn này để truyền payload đầy đủ vào refreshToken
  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as { id: string; role: RoleAuth };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token đã hết hạn. Vui lòng thử lại.');
    } else {
      throw new BadRequestException('Token không hợp lệ.');
    }
  }
}
