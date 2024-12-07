import { Document } from 'mongoose';

export interface ContractTerm extends Document {
  content: string;
}
