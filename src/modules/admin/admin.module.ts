import { AdminController } from './admin.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class AdminModule {}
