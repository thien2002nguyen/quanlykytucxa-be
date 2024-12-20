import { Document, Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';

export enum PaymentStatusEnum {
  UNPAID = 'unpaid', // Chưa trả
  PAID = 'paid', // Đã trả
}

export enum PaymentMethodEnum {
  CASH = 'cash', // Thanh toán bằng tiền mặt
  BANK_TRANSFER = 'bank_transfer', // Thanh toán qua chuyển khoản ngân hàng
  VNPAY = 'vnpay', // Thanh toán qua VNPAY
}

export interface PaymentType extends Document {
  fullName: string;
  studentCode: string;
  phoneNumber: string;
  email: string;

  room: {
    roomId: Types.ObjectId;
    roomName: string;
    floor: number;
    roomType: string;
    roomBlock: string;
    price: number;
  };

  service: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
    createdAt: string;
  }[];

  term: {
    termId: Types.ObjectId;
    content: string;
  }[];

  contractType: {
    contractTypeId: Types.ObjectId;
    contractTitle: string;
    duration: number;
    unit: TimeUnitEnum;
  };

  totalAmount: number;
  adminId: Types.ObjectId;
  note?: string;
  status: PaymentStatusEnum;
  paymentMethod?: PaymentMethodEnum;
  paymentDate?: string;
}

export interface CreateMonthlyPaymentInterface {
  fullName: string;
  studentCode: string;
  phoneNumber: string;
  email: string;
  room: {
    roomId: Types.ObjectId;
    roomName: string;
    floor: number;
    roomType: string;
    roomBlock: string;
    price: number;
  };
  service: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
    createdAt: string;
  }[];
  term: {
    termId: Types.ObjectId;
    content: string;
  }[];
  contractType: {
    contractTypeId: Types.ObjectId;
    contractTitle: string;
    duration: number;
    unit: TimeUnitEnum;
  };
  totalAmount: number;
  status: PaymentStatusEnum;
}
