import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean } from 'class-validator';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Room extends Document {
  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true, unique: true })
  roomSlug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  maximumCapacity: number;

  @Prop({ required: true })
  floor: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'RoomBlock' })
  roomBlockId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'RoomType' })
  roomTypeId: Types.ObjectId;

  @Prop()
  thumbnail: string;

  @Prop()
  images: string[];

  @Prop({
    default: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
