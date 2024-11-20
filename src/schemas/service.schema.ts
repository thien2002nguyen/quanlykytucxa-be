import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  unit: string;

  @Prop({
    required: true,
    type: [
      {
        dayOfWeek: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
  })
  schedule: { dayOfWeek: string; time: string }[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
