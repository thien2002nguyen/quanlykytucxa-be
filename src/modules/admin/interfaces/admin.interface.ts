import { Document } from 'mongoose';

export interface Admin extends Document {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  refreshToken?: string;
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
