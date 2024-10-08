import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from 'src/schemas/rooms.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    AdminModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
