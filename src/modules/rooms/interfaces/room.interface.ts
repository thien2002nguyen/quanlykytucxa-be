import { Document } from 'mongoose';

export interface Room extends Document {
  roomName: string;
  roomSlug: string;
  description: string;
  maximumCapacity: number;
  floor: number;
  status: string;
  thumbnail?: string;
  images?: string[];
}
