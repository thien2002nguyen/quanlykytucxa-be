import { Document } from 'mongoose';

export enum RoleAuth {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  STUDENT = 'student',
}

export interface User extends Document {
  userName: string;
  phoneNumber: string;
  email: string;
  password: string;
  refreshToken?: string;
  avatar?: string;
  role: RoleAuth;
  isBlocked: boolean;
  otp?: string;
  otpExpiration?: number;
}

export interface InsertUserInterface {
  userName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: RoleAuth;
  isBlocked?: boolean;
}

export interface LoginInterface {
  userName: string;
  password: string;
}

export interface RegisterResponseInterface {
  message: string;
  data: {
    email: string;
    studentCode: string;
  };
}
