import { Document, Types } from 'mongoose';

export interface News extends Document {
  slug: string;
  title: string;
  description: string;
  content: string;
  image: string;
  adminId: Types.ObjectId;
  isActive: boolean;
}
