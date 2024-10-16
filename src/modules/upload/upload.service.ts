import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Upload, UploadResponse } from './interfaces/upload.interface';
import * as streamifier from 'streamifier';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel('Upload') private readonly uploadModel: Model<Upload>,
  ) {}

  // Phương thức tải lên file tới Cloudinary
  async uploadFile(file: Express.Multer.File): Promise<UploadResponse> {
    return new Promise<UploadResponse>((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new Error('Không có buffer của file.'));
      }

      const folder = process.env.CLOUDINARY_FOLDER || 'quanlykytucxa';

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        async (error, result) => {
          if (error) {
            return reject(error);
          }

          // Lưu thông tin vào MongoDB
          const uploadData = new this.uploadModel({
            public_id: result.public_id, // Lưu public_id từ Cloudinary
            secure_url: result.secure_url, // Lưu secure_url hình ảnh
          });
          await uploadData.save(); // Lưu vào cơ sở dữ liệu

          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // Phương thức tải lên nhiều file tới Cloudinary
  async uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file) => {
      return new Promise<UploadResponse>((resolve, reject) => {
        if (!file || !file.buffer) {
          return reject(new Error('Không có buffer của file.')); // Thông báo lỗi nếu không có buffer
        }

        const folder = process.env.CLOUDINARY_FOLDER || 'quanlykytucxa';

        const uploadStream = cloudinary.uploader.upload_stream(
          { folder }, // Chỉ định thư mục lưu trữ trên Cloudinary
          (error, result) => {
            if (error) {
              return reject(error); // Xử lý lỗi nếu có
            }
            resolve(result); // Trả về kết quả khi upload thành công
          },
        );

        // Tạo stream từ buffer của file và đẩy vào uploadStream
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    });

    // Chờ cho tất cả các upload hoàn tất
    return Promise.all(uploadPromises);
  }

  // Phương thức xóa file trên Cloudinary và trong database
  async deleteFile(public_id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // Gọi phương thức destroy của Cloudinary để xóa ảnh
      cloudinary.uploader.destroy(public_id, async (error, result) => {
        if (error) {
          return reject(error); // Xử lý lỗi nếu có
        }

        // Xóa bản ghi tương ứng trong database
        try {
          await this.uploadModel.deleteOne({ public_id }); // Xóa theo public_id
          resolve(result); // Trả về kết quả khi xóa thành công
        } catch (dbError) {
          reject(dbError); // Xử lý lỗi nếu không xóa được trong database
        }
      });
    });
  }

  // Phương thức xóa nhiều file trên Cloudinary
  async deleteMultipleFiles(public_ids: string[]): Promise<void> {
    const deletePromises = public_ids.map((public_id) => {
      return new Promise((resolve, reject) => {
        // Gọi phương thức destroy của Cloudinary để xóa ảnh
        cloudinary.uploader.destroy(public_id, (error, result) => {
          if (error) {
            return reject(error); // Xử lý lỗi nếu có
          }
          resolve(result); // Trả về kết quả khi xóa thành công
        });
      });
    });

    // Chờ cho tất cả các xóa hoàn tất
    await Promise.all(deletePromises);
  }
}
