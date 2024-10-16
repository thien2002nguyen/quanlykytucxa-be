import { Request } from 'express';
import { Document } from 'mongoose';

export interface Admin extends Document {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  refreshToken?: string;
  avatar?: string;
  role: RoleAdmin;
}

export interface AdminAccount {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: RoleAdmin;
}

export interface AdminRequest extends Request {
  auth: Admin;
}

export enum RoleAdmin {
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}
