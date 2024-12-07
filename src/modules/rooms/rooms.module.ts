import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from 'src/schemas/room.schema';
import { UsersModule } from '../users/users.module';
import { RoomBlockModule } from '../room-block/room-block.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    UsersModule,
    RoomBlockModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class RoomsModule {}
