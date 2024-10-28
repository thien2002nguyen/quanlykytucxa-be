import { Module } from '@nestjs/common';
import { BannerController } from './banners.controller';
import { BannerService } from './banners.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from 'src/schemas/banners.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
    AdminModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannersModule {}
