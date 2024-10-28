import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Banner extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ default: true })
  isActive: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
