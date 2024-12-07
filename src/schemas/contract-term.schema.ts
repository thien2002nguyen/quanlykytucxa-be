import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ContractTerm extends Document {
  @Prop({ required: true })
  content: string;
}

export const ContractTermSchema = SchemaFactory.createForClass(ContractTerm);
