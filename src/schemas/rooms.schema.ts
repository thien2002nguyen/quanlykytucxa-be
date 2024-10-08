import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean, IsNumber } from 'class-validator';
import { Document } from 'mongoose';

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

  @Prop({
    default: 0, // Khởi tạo số người đã đăng ký là 0
  })
  @IsNumber()
  registeredCount: number;

  @Prop({
    default:
      'https://www.cvent.com/sites/default/files/image/2021-10/hotel%20room%20with%20beachfront%20view.jpg',
  })
  thumbnail: string;

  @Prop({
    default:
      'https://www.cvent.com/sites/default/files/image/2021-10/hotel%20room%20with%20beachfront%20view.jpg',
  })
  images: string[];

  @Prop({
    default: true, // Mặc định phòng sẽ hiển thị
  })
  @IsBoolean()
  isActive: boolean; // Trạng thái hiển thị phòng
}

export const RoomSchema = SchemaFactory.createForClass(Room);
