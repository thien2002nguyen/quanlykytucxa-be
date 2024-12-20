import { Module } from '@nestjs/common';
import { RoomTypeController } from './room-type.controller';
import { RoomTypeService } from './room-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { RoomType, RoomTypeSchema } from 'src/schemas/room-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomType.name, schema: RoomTypeSchema },
    ]),
    UsersModule,
  ],
  controllers: [RoomTypeController],
  providers: [RoomTypeService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class RoomTypeModule {}
