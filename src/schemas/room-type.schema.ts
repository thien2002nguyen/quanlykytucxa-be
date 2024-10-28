import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RoomType extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  price: number;
}

export const RoomTypeSchema = SchemaFactory.createForClass(RoomType);
