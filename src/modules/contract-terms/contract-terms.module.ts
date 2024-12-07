import { Module } from '@nestjs/common';
import { ContractTermsController } from './contract-terms.controller';
import { ContractTermsService } from './contract-terms.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractTerm,
  ContractTermSchema,
} from 'src/schemas/contract-term.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractTerm.name, schema: ContractTermSchema },
    ]),
    UsersModule,
  ],
  controllers: [ContractTermsController],
  providers: [ContractTermsService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class ContractTermsModule {}
