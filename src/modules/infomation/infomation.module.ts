import { Module } from '@nestjs/common';
import { InfomationController } from './infomation.controller';
import { InfomationService } from './infomation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { Infomation, InfomationSchema } from 'src/schemas/infomation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Infomation.name, schema: InfomationSchema },
    ]),
    UsersModule,
  ],
  controllers: [InfomationController],
  providers: [InfomationService],
})
export class InfomationModule {}
