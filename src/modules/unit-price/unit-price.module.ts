import { Module } from '@nestjs/common';
import { UnitPriceController } from './unit-price.controller';
import { UnitPriceService } from './unit-price.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitPrice, UnitPriceSchema } from 'src/schemas/unit-price.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnitPrice.name, schema: UnitPriceSchema },
    ]),
    UsersModule,
  ],
  controllers: [UnitPriceController],
  providers: [UnitPriceService],
})
export class UnitPriceModule {}
