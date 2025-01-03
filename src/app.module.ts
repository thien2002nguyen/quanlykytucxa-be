import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { getMongoDbConfig } from './config/database.config';
import { StudentsModule } from './modules/students/students.module';
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
import { UsersModule } from './modules/users/users.module';
import { NewsModule } from './modules/news/news.module';
import { InfomationModule } from './modules/infomation/infomation.module';
import { ContractTermsModule } from './modules/contract-terms/contract-terms.module';
import { ContractTypesModule } from './modules/contract-types/contract-types.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { IncidentsModule } from './modules/incidents/incidents.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getMongoDbConfig(configService),
    }),
    UsersModule,
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
    NewsModule,
    InfomationModule,
    ContractTermsModule,
    ContractTypesModule,
    ContractsModule,
    PaymentsModule,
    IncidentsModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
