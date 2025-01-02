import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contract, ContractSchema } from 'src/schemas/contract.schema';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ServicesModule } from '../services/services.module';
import { ContractTypesModule } from '../contract-types/contract-types.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
    UsersModule,
    RoomsModule,
    ServicesModule,
    ContractTypesModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class ContractsModule {}
