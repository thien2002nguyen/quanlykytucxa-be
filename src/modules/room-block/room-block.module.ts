import { Module } from '@nestjs/common';
import { RoomBlockController } from './room-block.controller';
import { RoomBlockService } from './room-block.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomBlock, RoomBlockSchema } from 'src/schemas/room-block.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomBlock.name, schema: RoomBlockSchema },
    ]),
    AdminModule,
  ],
  controllers: [RoomBlockController],
  providers: [RoomBlockService],
  exports: [MongooseModule],
})
export class RoomBlockModule {}
