import { Document, Types } from 'mongoose';

export interface DeviceItem {
  deviceName: string;
  quantity: string;
  status: boolean;
}

export interface Room extends Document {
  roomName: string;
  roomSlug: string;
  description: string;
  maximumCapacity: number;
  floor: number;
  roomBlockId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  device: DeviceItem[];
  thumbnail?: string;
  images?: string[];
  isActive: string;
}
