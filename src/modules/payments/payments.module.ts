import { forwardRef, Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';
import { UsersModule } from '../users/users.module';
import { ContractsModule } from '../contracts/contracts.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ContractTypesModule } from '../contract-types/contract-types.module';
import { RoomTypeModule } from '../room-type/room-type.module';
import { RoomBlockModule } from '../room-block/room-block.module';
import { ServicesModule } from '../services/services.module';
import { ConfigModule } from '@nestjs/config';
import { VnpayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { StudentsModule } from '../students/students.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    UsersModule,
    RoomsModule,
    RoomTypeModule,
    RoomBlockModule,
    ContractTypesModule,
    ServicesModule,
    forwardRef(() => StudentsModule),
    forwardRef(() => ContractsModule),
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, VnpayService, MomoService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class PaymentsModule {}
