import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export type UploadResponse = UploadApiResponse | UploadApiErrorResponse;

export interface Upload extends Document {
  public_id: string;
  secure_url: string;
}
