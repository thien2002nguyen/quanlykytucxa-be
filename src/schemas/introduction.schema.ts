import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Introduction extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  youtubeUrl: string;

  @Prop({ required: true })
  content: string;
}

export const IntroductionSchema = SchemaFactory.createForClass(Introduction);
