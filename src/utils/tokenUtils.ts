import * as jwt from 'jsonwebtoken';
import { RoleAdmin } from 'src/modules/admin/interfaces/admin.interface';

const SECRET_KEY = process.env.SECRET_KEY || 'nguyen_canh_thien';
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '1d';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

interface TokenPayload {
  id: string;
  role?: RoleAdmin;
}

/**
 * Sinh access token và refresh token
 * @param _id - ID của người dùng
 * @returns Một đối tượng chứa access token và refresh token
 */
export function generateAccessAdminToken(id: string, role: RoleAdmin) {
  const payload: TokenPayload = { id, role };

  const accessToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  return accessToken;
}

export function generateRefreshAdminToken(id: string, role: RoleAdmin) {
  const payload: TokenPayload = { id, role };

  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  return refreshToken;
}

export function verifyAdminToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as { id: string; role: RoleAdmin };
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
    return null;
  }
}

export function generateAccessStudentToken(id: string) {
  const payload: TokenPayload = { id };

  const accessToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });

  return accessToken;
}

export function generateRefreshStudentToken(id: string) {
  const payload: TokenPayload = { id };

  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  return refreshToken;
}

export function verifyStudentToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as { id: string };
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
    return null;
  }
}
