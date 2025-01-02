import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from 'src/modules/payments/interfaces/payments.interface';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  studentCode: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  contractId: Types.ObjectId;

  @Prop({
    required: true,
    type: {
      roomId: { type: Types.ObjectId, ref: 'Room', required: true },
      roomName: { type: String, required: true },
      floor: { type: Number, required: true },
      roomType: { type: String, required: true },
      roomBlock: { type: String, required: true },
      price: { type: Number, required: true },
    },
  })
  room: {
    roomId: Types.ObjectId;
    roomName: string;
    floor: number;
    roomType: string;
    roomBlock: string;
    price: number;
  };

  @Prop({
    required: true,
    type: [
      {
        serviceId: { type: Types.ObjectId, ref: 'Service', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        createdAt: { type: String, required: true },
      },
    ],
  })
  services: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
    createdAt: string;
  }[];

  @Prop({
    required: true,
    type: {
      contractTypeId: {
        type: Types.ObjectId,
        ref: 'ContractType',
        required: true,
      },
      contractTitle: { type: String, required: true },
      duration: { type: Number, required: true },
      unit: { type: String, enum: Object.values(TimeUnitEnum), required: true },
    },
  })
  contractType: {
    contractTypeId: Types.ObjectId;
    contractTitle: string;
    duration: number;
    unit: TimeUnitEnum;
  };

  @Prop({ type: Number, default: 0 })
  totalAmount: number;

  @Prop({ type: Number, default: 0 })
  remainingAmount: number;

  @Prop({ type: Number, default: 0 })
  paidAmount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;

  @Prop()
  note: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatusEnum),
    default: PaymentStatusEnum.UNPAID,
  })
  status: PaymentStatusEnum;

  @Prop({
    type: [
      {
        paymentMethod: {
          type: String,
          enum: Object.values(PaymentMethodEnum),
          required: true,
        },
        amount: { type: Number, required: true },
        paymentDate: { type: String, required: true },
      },
    ],
  })
  paymentHistory: {
    paymentMethod: PaymentMethodEnum;
    amount: number;
    paymentDate: string;
  }[];
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.pre('save', function (next) {
  if (
    this.isModified('room') ||
    this.isModified('services') ||
    this.isModified('paymentHistory') ||
    this.isModified('paidAmount')
  ) {
    const roomPrice = this.room?.price || 0;
    const servicePrice =
      this.services?.reduce((total, service) => total + service.price, 0) || 0;

    // Tính toán totalAmount
    this.totalAmount = roomPrice + servicePrice;

    // Cập nhật lại paidAmount
    if (this.paymentHistory && this.paymentHistory.length > 0) {
      const totalPaymentHistoryAmount = this.paymentHistory.reduce(
        (total, payment) => total + payment.amount,
        0,
      );

      this.paidAmount = totalPaymentHistoryAmount;
    }

    // Tính toán remainingAmount
    this.remainingAmount = this.totalAmount - this.paidAmount;

    // Cập nhật trạng thái dựa trên paidAmount và remainingAmount
    if (this.paidAmount === 0) {
      this.status = PaymentStatusEnum.UNPAID;
    } else if (this.remainingAmount > 0) {
      this.status = PaymentStatusEnum.PARTIALLY_PAID;
    } else if (this.remainingAmount === 0) {
      this.status = PaymentStatusEnum.PAID;
    }
  }
  next();
});
