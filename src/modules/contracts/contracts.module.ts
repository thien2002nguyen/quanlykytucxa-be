import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contract, ContractSchema } from 'src/schemas/contract.schema';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { UsersModule } from '../users/users.module'; // Giả sử có liên kết với Users
import { RoomsModule } from '../rooms/rooms.module';
import { ServicesModule } from '../services/services.module';
import { ContractTypesModule } from '../contract-types/contract-types.module';
import { ContractTermsModule } from '../contract-terms/contract-terms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
    UsersModule, // Import User module nếu cần liên kết với người dùng
    RoomsModule,
    ServicesModule,
    ContractTermsModule,
    ContractTypesModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
