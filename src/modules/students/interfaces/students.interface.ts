import { Document, Types } from 'mongoose';

export enum GenderEnum {
  nam = 'NAM',
  nu = 'NU',
}

export interface Student extends Document {
  userId?: Types.ObjectId;
  studentCode: string;
  nationalIdCard: string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderEnum;
  takeClass: string;
  department: string;
  address: string;
  enrollmentYear: string;
  roomId?: Types.ObjectId;
  contractId?: Types.ObjectId;
}

export interface StudentRequest extends Request {
  student: Student;
}
