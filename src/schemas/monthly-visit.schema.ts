import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MonthlyVisit extends Document {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  month: number;

  @Prop({ default: 0 })
  visitCount: number;
}

export const MonthlyVisitSchema = SchemaFactory.createForClass(MonthlyVisit);
