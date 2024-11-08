import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { getMongoDbConfig } from './config/database.config';
import { StudentsModule } from './modules/students/students.module';
import { AdminModule } from './modules/admin/admin.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { UploadModule } from './modules/upload/upload.module';
import { ServicesModule } from './modules/services/services.module';
import { RoomTypeModule } from './modules/room-type/room-type.module';
import { RoomBlockModule } from './modules/room-block/room-block.module';
import { MonthlyVisitsModule } from './modules/monthly-visits/monthly-visits.module';
import { SchoolModule } from './modules/school/school.module';
import { BannersModule } from './modules/banners/banners.module';
import { IntroductionModule } from './modules/introduction/introduction.module';
import { UnitPriceModule } from './modules/unit-price/unit-price.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getMongoDbConfig(configService),
    }),
    AdminModule,
    StudentsModule,
    RoomsModule,
    UploadModule,
    ServicesModule,
    RoomTypeModule,
    RoomBlockModule,
    MonthlyVisitsModule,
    SchoolModule,
    BannersModule,
    IntroductionModule,
    UnitPriceModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
