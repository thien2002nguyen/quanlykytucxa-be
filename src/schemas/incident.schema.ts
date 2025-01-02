import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IncidentStatus } from 'src/modules/incidents/interfaces/incident.interface';

@Schema({ timestamps: true })
export class Incident extends Document {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  images: string[];

  @Prop({ default: IncidentStatus.PENDING })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  resolvedAt: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);
