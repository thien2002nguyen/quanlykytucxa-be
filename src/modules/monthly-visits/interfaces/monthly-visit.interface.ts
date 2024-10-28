import { Document } from 'mongoose';

export interface MonthlyVisit extends Document {
  year: number;
  month: number;
  visitCount: number;
}
