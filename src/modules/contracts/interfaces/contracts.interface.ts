import { Document, Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';
import { Student } from 'src/modules/students/interfaces/students.interface';

export enum StatusEnum {
  PENDING = 'pending', // Đang chờ xác nhận
  CONFIRMED = 'confirmed', // Đã xác nhận
  PENDING_CANCELLATION = 'pending_cancellation', // Đang chờ hủy
  CANCELLED = 'cancelled', // Đã hủy
  EXPIRED = 'expired', // Đã hết hạn'
}
// Interface cho Room
export interface RoomInterface {
  roomId: Types.ObjectId;
  roomName: string;
  price: number;
}

// Interface cho Service
export interface ServiceInterface {
  serviceId: Types.ObjectId;
  name: string;
  price: number;
  createdAt?: string;
}

// Interface cho Term
export interface TermInterface {
  termId: Types.ObjectId;
  content: string;
}

// Interface cho ContractType
export interface ContractTypeInterface {
  contractTypeId: Types.ObjectId;
  duration: number;
  unit: TimeUnitEnum;
}

// Interface chính cho Contract
export interface Contract extends Document {
  fullName: string;
  studentCode: string;
  email: string;
  phoneNumber: string;
  studentInfomation?: Student;
  room: RoomInterface;
  service: ServiceInterface[];
  term: TermInterface[];
  contractType: ContractTypeInterface;
  startDate?: string;
  endDate?: string;
  adminId?: Types.ObjectId;
  status: StatusEnum;
  approvedDate?: string; // Ngày duyệt hợp đồng
  checkInDate?: string; // Ngày nhận phòng
  checkOutDate?: string; // Ngày trả phòng
}
