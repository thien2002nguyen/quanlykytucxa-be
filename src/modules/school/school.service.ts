import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from './interfaces/school.interface';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel('School') private readonly schoolModel: Model<School>,
  ) {}

  async findSchoolInfo(): Promise<School> {
    return await this.schoolModel.findOne();
  }

  async updateSchoolInfo(updateSchoolDto: UpdateSchoolDto): Promise<School> {
    return await this.schoolModel.findOneAndUpdate(
      {}, // Điều kiện tìm kiếm, bỏ trống để tìm bất kỳ bản ghi nào
      updateSchoolDto, // Dữ liệu cập nhật
      {
        new: true, // Trả về bản ghi mới đã cập nhật
        upsert: true, // Nếu không tìm thấy bản ghi, tạo mới
      },
    );
  }
}
