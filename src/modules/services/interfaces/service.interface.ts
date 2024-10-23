import { Document } from 'mongoose';

export interface Service extends Document {
  name: string;
  price: number;
}
