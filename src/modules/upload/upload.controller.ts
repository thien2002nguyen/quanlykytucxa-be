import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const result = await this.uploadService.uploadFile(file);
    return {
      public_id: result.public_id, // Trả về key
      secure_url: result.secure_url, // Trả về link
    };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files')) // Sử dụng FilesInterceptor để xử lý nhiều file
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Cần có ít nhất một file để tải lên'); // Thông báo lỗi nếu không có file
    }
    return this.uploadService.uploadMultipleFiles(files); // Gọi phương thức tải lên nhiều file
  }

  @Delete('image')
  async deleteImage(@Body('public_id') public_id: string) {
    // Kiểm tra xem public_id có tồn tại không
    if (!public_id) {
      throw new BadRequestException('Public ID là bắt buộc'); // Thông báo lỗi nếu không có public_id
    }
    await this.uploadService.deleteFile(public_id); // Gọi phương thức xóa ảnh
    return { message: 'Xóa ảnh thành công' }; // Trả về thông báo thành công
  }

  @Delete('images')
  async deleteImages(@Body('public_ids') public_ids: string[]) {
    if (!public_ids || public_ids.length === 0) {
      throw new BadRequestException('Cần có ít nhất một public ID để xóa'); // Thông báo lỗi nếu không có public_id
    }
    await this.uploadService.deleteMultipleFiles(public_ids); // Gọi phương thức xóa ảnh
    return { message: 'Xóa ảnh thành công' }; // Trả về thông báo thành công
  }
}
