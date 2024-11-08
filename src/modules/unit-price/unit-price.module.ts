import { Module } from '@nestjs/common';
import { UnitPriceController } from './unit-price.controller';
import { UnitPriceService } from './unit-price.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitPrice, UnitPriceSchema } from 'src/schemas/unit-price.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnitPrice.name, schema: UnitPriceSchema },
    ]),
    AdminModule,
  ],
  controllers: [UnitPriceController],
  providers: [UnitPriceService],
})
export class UnitPriceModule {}
