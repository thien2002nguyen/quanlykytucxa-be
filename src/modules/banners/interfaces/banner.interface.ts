import { Document } from 'mongoose';

export interface Banner extends Document {
  url: string;
  isActive: boolean;
}
