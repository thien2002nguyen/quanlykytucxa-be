import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Upload extends Document {
  @Prop({ required: true })
  public_id: string;

  @Prop({ required: true })
  secure_url: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
