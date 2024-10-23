import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { AdminModule } from '../admin/admin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from 'src/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    AdminModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
