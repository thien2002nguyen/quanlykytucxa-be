import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnitPrice } from './interfaces/unit-price.interface';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';

@Injectable()
export class UnitPriceService {
  constructor(
    @InjectModel('UnitPrice')
    private readonly unitPriceModel: Model<UnitPrice>,
  ) {}

  // Tìm một đơn giá (có thể tìm theo điều kiện cụ thể nếu cần)
  async findUnitPrice(): Promise<UnitPrice> {
    return await this.unitPriceModel.findOne();
  }

  // Cập nhật đơn giá
  async updateUnitPriceInfo(
    updateUnitPriceDto: UpdateUnitPriceDto,
  ): Promise<UnitPrice[]> {
    return await this.unitPriceModel.findOneAndUpdate(
      {}, // Điều kiện tìm kiếm, bỏ trống để tìm bất kỳ bản ghi nào
      updateUnitPriceDto, // Dữ liệu cập nhật
      {
        new: true, // Trả về bản ghi mới đã cập nhật
        upsert: true, // Nếu không tìm thấy bản ghi, tạo mới
      },
    );
  }
}
