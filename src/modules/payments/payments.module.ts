import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';
import { UsersModule } from '../users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ContractsModule } from '../contracts/contracts.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ContractTypesModule } from '../contract-types/contract-types.module';
import { RoomTypeModule } from '../room-type/room-type.module';
import { RoomBlockModule } from '../room-block/room-block.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ScheduleModule.forRoot(),
    UsersModule,
    ContractsModule,
    RoomsModule,
    RoomTypeModule,
    RoomBlockModule,
    ContractTypesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class PaymentsModule {}
