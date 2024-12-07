import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TimeUnitEnum } from 'src/modules/contract-types/interfaces/contract-types.interface';

@Schema({ timestamps: true })
export class ContractType extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  unit: TimeUnitEnum;
}

export const ContractTypeSchema = SchemaFactory.createForClass(ContractType);
