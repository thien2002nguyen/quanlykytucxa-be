import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Infomation extends Document {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const InfomationSchema = SchemaFactory.createForClass(Infomation);
