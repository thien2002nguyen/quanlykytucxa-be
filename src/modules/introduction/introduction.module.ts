import { Module } from '@nestjs/common';
import { IntroductionController } from './introduction.controller';
import { IntroductionService } from './introduction.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Introduction,
  IntroductionSchema,
} from 'src/schemas/introduction.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Introduction.name, schema: IntroductionSchema },
    ]),
    AdminModule,
  ],
  controllers: [IntroductionController],
  providers: [IntroductionService],
})
export class IntroductionModule {}
