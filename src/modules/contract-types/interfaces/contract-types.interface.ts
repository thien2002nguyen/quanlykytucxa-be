import { Document } from 'mongoose';

export enum TimeUnitEnum {
  YEAR = 'year', // Năm
  MONTH = 'month', // Tháng
  DAY = 'day', // Ngày
}

export interface ContractType extends Document {
  title: string;
  duration: number;
  unit: TimeUnitEnum;
}
