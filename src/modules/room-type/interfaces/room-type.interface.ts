import { Document } from 'mongoose';

export interface RoomType extends Document {
  type: string;
  price: number;
}
