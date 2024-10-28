import { Module } from '@nestjs/common';
import { MonthlyVisitService } from './monthly-visits.service';
import { MonthlyVisitController } from './monthly-visits.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MonthlyVisit,
  MonthlyVisitSchema,
} from 'src/schemas/monthly-visit.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MonthlyVisit.name, schema: MonthlyVisitSchema },
    ]),
    AdminModule,
  ],
  controllers: [MonthlyVisitController],
  providers: [MonthlyVisitService],
})
export class MonthlyVisitsModule {}
