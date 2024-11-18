import { Module } from '@nestjs/common';
import { BannerController } from './banners.controller';
import { BannerService } from './banners.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from 'src/schemas/banners.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
    UsersModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannersModule {}
