import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database/database.service';
import { getMongoDbConfig } from './config/database.config';
import { StudentsModule } from './modules/students/students.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getMongoDbConfig(configService),
    }),
    StudentsModule,
    AdminModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
