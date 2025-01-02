import { Document, Types } from 'mongoose';

export enum StatusEnum {
  PENDING = 'pending', // Đang chờ xác nhận
  CONFIRMED = 'confirmed', // Đã xác nhận
  PENDING_CANCELLATION = 'pending_cancellation', // Đang chờ hủy
  CANCELLED = 'cancelled', // Đã hủy
  EXPIRED = 'expired', // Đã hết hạn'
}

// Interface cho Service
export interface ServiceInterface {
  serviceId: Types.ObjectId;
  createdAt?: string;
}

// Interface chính cho Contract
export interface Contract extends Document {
  fullName: string;
  studentCode: string;
  email: string;
  phoneNumber: string;
  roomId: Types.ObjectId;
  services: ServiceInterface[];
  contractTypeId: Types.ObjectId;
  startDate?: string;
  endDate?: string;
  adminId?: Types.ObjectId;
  status: StatusEnum;
  approvedDate?: string; // Ngày duyệt hợp đồng
  checkInDate?: string; // Ngày nhận phòng
  checkOutDate?: string; // Ngày trả phòng
}
