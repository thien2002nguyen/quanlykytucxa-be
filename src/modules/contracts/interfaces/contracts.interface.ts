import { Document, Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';

export enum StatusEnum {
  PENDING = 'pending', // Đang chờ xác nhận
  CONFIRMED = 'confirmed', // Đã xác nhận
  PENDING_CANCELLATION = 'pending_cancellation', // Đang chờ hủy
  CANCELLED = 'cancelled', // Đã hủy
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
  status: StatusEnum;
  confirmedAt?: string; // Giá trị này có thể không bắt buộc
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
  studentCode: string;
  room: RoomInterface;
  service: ServiceInterface[];
  terms: TermInterface[];
  contractType: ContractTypeInterface; // Đảm bảo đúng cấu trúc của `contractType`
  startDate?: string; // Giá trị này có thể không bắt buộc
  endDate?: string; // Giá trị này có thể không bắt buộc
  adminId?: Types.ObjectId; // Quản trị viên có thể không được chỉ định
  status: StatusEnum;
}
