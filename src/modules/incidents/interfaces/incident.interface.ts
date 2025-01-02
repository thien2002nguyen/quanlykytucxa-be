import { Document, Types } from 'mongoose';

export enum IncidentStatus {
  PENDING = 'pending', // Chưa xử lý
  IN_PROGRESS = 'in_progress', // Đang xử lý
  RESOLVED = 'resolved', // Đã xử lý
}

export interface Incident extends Document {
  description: string;
  images: string[];
  status: IncidentStatus;
  userId: Types.ObjectId;
  resolvedAt: string;
  adminId: Types.ObjectId;
}
