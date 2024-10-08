import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Student extends Document {
  @Prop({ required: true, unique: true })
  studentId: string;

  @Prop({ required: true, unique: true })
  nationalIdCard: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  class: string;

  @Prop({ required: true })
  faculty: string; // học khoa (CNTT)

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  contactAddress: string;

  @Prop({ required: true })
  course: string; // niên khóa

  @Prop()
  roomId: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
