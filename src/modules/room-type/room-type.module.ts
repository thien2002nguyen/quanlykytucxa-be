import { Module } from '@nestjs/common';
import { RoomTypeController } from './room-type.controller';
import { RoomTypeService } from './room-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { RoomType, RoomTypeSchema } from 'src/schemas/room-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomType.name, schema: RoomTypeSchema },
    ]),
    AdminModule,
  ],
  controllers: [RoomTypeController],
  providers: [RoomTypeService],
})
export class RoomTypeModule {}
