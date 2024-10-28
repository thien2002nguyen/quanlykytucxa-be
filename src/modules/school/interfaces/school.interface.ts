import { Document } from 'mongoose';

export interface School extends Document {
  schoolName: string;
  zaloUrl: string;
  facebookUrl: string;
  googleMapUrl: string;
  phoneNumber: string;
  email: string;
  address: string;
  slogan: string;
  timeWork: string;
}
