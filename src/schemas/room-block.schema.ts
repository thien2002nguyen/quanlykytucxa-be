import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RoomBlock extends Document {
  @Prop({ required: true })
  name: string;
}

export const RoomBlockSchema = SchemaFactory.createForClass(RoomBlock);
