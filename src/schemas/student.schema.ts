import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Student extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true, unique: true })
  studentCode: string;

  @Prop({ required: true, unique: true })
  nationalIdCard: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ default: 'NAM' })
  gender: string;

  @Prop({ required: true })
  takeClass: string; // lớp

  @Prop({ required: true })
  department: string; // phòng - khoa (CNTT)

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  enrollmentYear: string; // tuyển sinh năm

  @Prop({ type: Types.ObjectId, ref: 'Room' })
  roomId: Types.ObjectId; // ở phòng
}

export const StudentSchema = SchemaFactory.createForClass(Student);
