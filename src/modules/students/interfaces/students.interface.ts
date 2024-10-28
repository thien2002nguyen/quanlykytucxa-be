import { Document, Types } from 'mongoose';

export interface Student extends Document {
  studentId: string;
  nationalIdCard: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  class: string;
  faculty: string;
  phoneNumber: string;
  email: string;
  contactAddress: string;
  dateJoined: string;
  dateLeft: string;
  roomId?: Types.ObjectId;
  avatar?: string;
  password?: string;
  refreshToken?: string;
  isBlocked: boolean;
}

export interface StudentAccount {
  fullName: string;
  studentId: string;
  nationalIdCard: string;
  phoneNumber: string;
  email: string;
  password: string;
  course: string;
  class: string;
  faculty: string;
  gender: string;
  dateOfBirth: string;
  contactAddress: string;
  avatar?: string;
  roomId?: string;
}

export interface StudentRequest extends Request {
  student: Student;
}
