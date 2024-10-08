import { Request } from 'express';
import { Document } from 'mongoose';

export interface Admin extends Document {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  refreshToken?: string;
  avatar?: string;
}

export interface TypeLogin {
  userName: string;
  password: string;
}

export interface AdminAccount {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface AdminRequest extends Request {
  admin: Admin;
}
