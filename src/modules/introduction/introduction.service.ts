import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Introduction } from './interfaces/introduction.interface';
import { UpdateIntroductionDto } from './dto/update-introduction.dto';

@Injectable()
export class IntroductionService {
  constructor(
    @InjectModel('Introduction')
    private readonly introductionModel: Model<Introduction>,
  ) {}

  async findIntroduction(): Promise<Introduction> {
    return await this.introductionModel.findOne();
  }

  async updateIntroductionInfo(
    updateIntroductionDto: UpdateIntroductionDto,
  ): Promise<Introduction[]> {
    return await this.introductionModel.findOneAndUpdate(
      {}, // Điều kiện tìm kiếm, bỏ trống để tìm bất kỳ bản ghi nào
      updateIntroductionDto, // Dữ liệu cập nhật
      {
        new: true, // Trả về bản ghi mới đã cập nhật
        upsert: true, // Nếu không tìm thấy bản ghi, tạo mới
      },
    );
  }
}
