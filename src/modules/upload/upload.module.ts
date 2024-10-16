import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadProvider } from './upload.provider';
import { UploadController } from './upload.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
  ],
  controllers: [UploadController],
  providers: [UploadProvider, UploadService],
  exports: [UploadProvider, UploadService],
})
export class UploadModule {}
