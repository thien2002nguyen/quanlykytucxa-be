import { Module } from '@nestjs/common';
import { ContractTypesController } from './contract-types.controller';
import { ContractTypesService } from './contract-types.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractType,
  ContractTypeSchema,
} from 'src/schemas/contract-type.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractType.name, schema: ContractTypeSchema },
    ]),
    UsersModule,
  ],
  controllers: [ContractTypesController],
  providers: [ContractTypesService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class ContractTypesModule {}
