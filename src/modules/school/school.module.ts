import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { School, SchoolSchema } from 'src/schemas/school.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
    AdminModule,
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
