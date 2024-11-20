import { Document } from 'mongoose';

export interface ScheduleItem {
  dayOfWeek: string;
  time: string;
}

export interface Service extends Document {
  name: string;
  price: number;
  schedule: ScheduleItem[];
}
