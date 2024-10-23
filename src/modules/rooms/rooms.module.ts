import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from 'src/schemas/room.schema';
import { AdminModule } from '../admin/admin.module';
import { RoomBlockModule } from '../room-block/room-block.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    AdminModule,
    RoomBlockModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
