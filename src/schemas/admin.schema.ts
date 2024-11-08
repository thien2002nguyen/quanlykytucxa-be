import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RoleAdmin } from 'src/modules/admin/interfaces/admin.interface';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  refreshToken: string;

  @Prop()
  avatar: string;

  @Prop({ default: RoleAdmin.MODERATOR })
  role: RoleAdmin;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
