import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';
import { StatusEnum } from 'src/modules/contracts/interfaces/contracts.interface';

@Schema({ timestamps: true })
export class Contract extends Document {
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
      price: { type: Number, required: true },
    },
  })
  room: { roomId: Types.ObjectId; price: number };

  @Prop({
    required: true,
    type: [
      {
        serviceId: { type: Types.ObjectId, ref: 'Service', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        createdAt: { type: String },
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
      duration: { type: Number, required: true },
      unit: { type: String, enum: Object.values(TimeUnitEnum), required: true },
    },
  })
  contractType: {
    contractTypeId: Types.ObjectId;
    duration: number;
    unit: TimeUnitEnum;
  };

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(StatusEnum),
    default: StatusEnum.PENDING,
  })
  status: StatusEnum; // Đảm bảo rằng 'status' là kiểu String với enum đúng

  @Prop()
  approvedDate?: string; // Ngày duyệt hợp đồng

  @Prop()
  checkInDate?: string; // Ngày nhận phòng

  @Prop()
  checkOutDate?: string; // Ngày trả phòng
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
