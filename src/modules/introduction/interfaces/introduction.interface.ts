import { Document } from 'mongoose';

export interface Introduction extends Document {
  title: string;
  description: string;
  youtubeUrl: string;
  content: string;
}
