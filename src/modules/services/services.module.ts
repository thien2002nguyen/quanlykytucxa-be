import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from 'src/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    UsersModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class ServicesModule {}
