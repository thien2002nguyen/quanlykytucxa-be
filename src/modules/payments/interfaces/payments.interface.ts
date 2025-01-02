import { Document, Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';

export enum PaymentStatusEnum {
  UNPAID = 'unpaid', // Chưa trả
  PAID = 'paid', // Đã trả
  PARTIALLY_PAID = 'partially_paid', // Còn nợ
}

export enum PaymentMethodEnum {
  CASH = 'cash', // Thanh toán bằng tiền mặt
  BANK_TRANSFER = 'bank_transfer', // Thanh toán qua chuyển khoản ngân hàng
  VNPAY = 'vnpay', // Thanh toán qua VNPAY
  MOMO = 'momo', // Thanh toán qua MOMO
}

export interface VnpayCallbackResponse {
  status: string; // 'success' or 'error'
  message?: string; // Optional error message
  vnpayData?: Record<string, string>; // Include VNPay data if needed
}

export interface MomoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payURL: string;
  shortLink: string;
}

export interface MomoPaymentCallback {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

export interface Payment extends Document {
  fullName: string;
  studentCode: string;
  phoneNumber: string;
  email: string;

  contractId: Types.ObjectId;

  room: {
    roomId: Types.ObjectId;
    roomName: string;
    floor: number;
    roomType: string;
    roomBlock: string;
    price: number;
  };

  services: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
    createdAt: string;
  }[];

  contractType: {
    contractTypeId: Types.ObjectId;
    contractTitle: string;
    duration: number;
    unit: TimeUnitEnum;
  };

  totalAmount: number;
  remainingAmount: number;
  paidAmount: number;

  status: PaymentStatusEnum;
  adminId?: Types.ObjectId;
  note?: string;

  paymentHistory: {
    paymentMethod: PaymentMethodEnum;
    amount: number;
    paymentDate: string;
  }[];
}

export interface TotalBillInterface {
  totalAmount: number;
  remainingAmount: number;
  paidAmount: number;
}

export interface CreateMonthlyPaymentInterface {
  fullName: string;
  studentCode: string;
  phoneNumber: string;
  email: string;

  contractId: Types.ObjectId;

  room: {
    roomId: Types.ObjectId;
    roomName: string;
    floor: number;
    roomType: string;
    roomBlock: string;
    price: number;
  };

  services: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
    createdAt: string;
  }[];

  contractType: {
    contractTypeId: Types.ObjectId;
    contractTitle: string;
    duration: number;
    unit: TimeUnitEnum;
  };

  adminId?: Types.ObjectId;
  status: PaymentStatusEnum;
}
