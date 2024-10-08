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
}
