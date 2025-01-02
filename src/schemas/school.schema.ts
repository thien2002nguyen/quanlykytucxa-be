import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class School extends Document {
  @Prop({ required: true })
  schoolName: string;

  @Prop({ required: true })
  zaloUrl: string;

  @Prop({ required: true })
  facebookUrl: string;

  @Prop({ required: true })
  googleMapUrl: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  slogan: string;

  @Prop({ required: true })
  timeWork: string;

  @Prop({ required: true })
  rulesAndRegulations: string;

  @Prop({ required: true })
  guidelines: string;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
