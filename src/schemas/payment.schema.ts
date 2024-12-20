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
  service: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
    createdAt: string;
  }[];

  @Prop({
    required: true,
    type: [
      {
        termId: { type: Types.ObjectId, ref: 'ContractTerm', required: true },
        content: { type: String, required: true },
      },
    ],
  })
  term: { termId: Types.ObjectId; content: string }[];

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

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;

  @Prop()
  note: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatusEnum),
    default: PaymentStatusEnum.UNPAID,
  })
  status: PaymentStatusEnum; // Đảm bảo rằng 'status' là kiểu String với enum đúng

  @Prop({
    type: String,
    enum: Object.values(PaymentMethodEnum),
  })
  paymentMethod: PaymentMethodEnum;

  @Prop()
  paymentDate: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
