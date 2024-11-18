import { Document, Types } from 'mongoose';

export interface Student extends Document {
  userId?: Types.ObjectId;
  studentCode: string;
  nationalIdCard: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  takeClass: string;
  department: string;
  address: string;
  enrollmentYear: string;
  roomId?: Types.ObjectId;
}

export interface StudentRequest extends Request {
  student: Student;
}
