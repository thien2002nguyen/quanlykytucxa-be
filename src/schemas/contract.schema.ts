import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
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

  @Prop({ required: true, type: Types.ObjectId, ref: 'Room' })
  roomId: Types.ObjectId;

  @Prop({
    required: true,
    type: [
      {
        serviceId: { type: Types.ObjectId, ref: 'Service', required: true },
        createdAt: { type: String },
      },
    ],
  })
  services: {
    serviceId: Types.ObjectId;
    createdAt: string;
  }[];

  @Prop({ required: true, type: Types.ObjectId, ref: 'ContractType' })
  contractTypeId: Types.ObjectId;

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
