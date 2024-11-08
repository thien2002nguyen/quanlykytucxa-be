import { Document } from 'mongoose';

export interface UnitPrice extends Document {
  title: string;
  description: string;
  content: string;
}
