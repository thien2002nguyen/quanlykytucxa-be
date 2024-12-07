import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RoleAuth } from 'src/modules/users/interfaces/user.interface';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  refreshToken: string;

  @Prop()
  avatar: string;

  @Prop({ default: RoleAuth.STUDENT })
  role: RoleAuth;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  otp: string;

  @Prop()
  otpExpiration: number;

  @Prop()
  otpAccessToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
