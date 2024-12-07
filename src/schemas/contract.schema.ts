import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';
import { StatusEnum } from 'src/modules/contracts/interfaces/contracts.interface';

@Schema({ timestamps: true })
export class Contract extends Document {
  @Prop({ required: true })
  studentCode: string;

  @Prop({
    required: true,
    type: {
      roomId: { type: Types.ObjectId, required: true },
      price: { type: Number, required: true },
    },
  })
  room: { roomId: Types.ObjectId; price: number };

  @Prop({
    required: true,
    type: [
      {
        serviceId: { type: Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        status: {
          type: String, // Chỉnh sửa kiểu thành String
          enum: Object.values(StatusEnum), // Chỉ định enum từ StatusEnum
          default: StatusEnum.PENDING, // Giá trị mặc định là 'pending'
        },
        confirmedAt: { type: String },
      },
    ],
  })
  service: {
    serviceId: Types.ObjectId;
    name: string;
    price: number;
    unit: string;
    status: StatusEnum;
    confirmedAt: string;
  }[];

  @Prop({
    required: true,
    type: [
      {
        termId: { type: Types.ObjectId, required: true },
        content: { type: String, required: true },
      },
    ],
  })
  term: { termId: Types.ObjectId; content: string }[];

  @Prop({
    required: true,
    type: {
      contractTypeId: { type: Types.ObjectId, required: true },
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
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
