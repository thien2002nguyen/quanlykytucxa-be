import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Banner } from './interfaces/banner.interface';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { UpdateBannersStatusDto } from './dto/update-multi-banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel('Banner') private readonly bannerModel: Model<Banner>,
  ) {}

  async createBanner(createBannerDto: CreateBannerDto): Promise<Banner> {
    const newBanner = await this.bannerModel.create(createBannerDto);
    return newBanner;
  }

  async findBanners(): Promise<Banner[]> {
    return this.bannerModel.find();
  }

  async findByIdBanner(id: string): Promise<Banner> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với ID: ${id}`);
    }
    return banner;
  }

  async updateBanner(
    id: string,
    updateBannerDto: UpdateBannerDto,
  ): Promise<Banner> {
    const banner = await this.bannerModel.findByIdAndUpdate(
      id,
      updateBannerDto,
      {
        new: true,
      },
    );

    if (!banner) {
      throw new NotFoundException(`Không tìm thấy banner với ID ${id}`);
    }
    return banner;
  }

  async removeBanner(id: string): Promise<ResponseInterface> {
    const result = await this.bannerModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy banner với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Banner với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }

  async updateBannersStatus(
    updateBannersStatusDto: UpdateBannersStatusDto,
  ): Promise<ResponseInterface> {
    const { bannerIds, isActive } = updateBannersStatusDto;
    const result = await this.bannerModel.updateMany(
      { _id: { $in: bannerIds } },
      { $set: { isActive } },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        'Không tìm thấy banner nào với các ID đã cung cấp.',
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: `Banner đã được cập nhật trạng thái thành công.`,
      messageCode: 'UPDATE_SUCCESS',
    };
  }
}
