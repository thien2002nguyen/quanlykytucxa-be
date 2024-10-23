import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Service } from './interfaces/service.interface';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel('Service') private readonly serviceModel: Model<Service>,
  ) {}

  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    // Lưu dịch vụ mới
    const newService = await this.serviceModel.create(createServiceDto);
    return newService;
  }

  async findServices(): Promise<Service[]> {
    // Lấy tất cả quản trị viên từ cơ sở dữ liệu
    return this.serviceModel.find();
  }

  async findByIdService(id: string): Promise<Service> {
    // Kiểm tra xem id có phải là một ObjectId hợp lệ không
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    // Tìm dịch vụ theo ID
    const service = await this.serviceModel.findById(id);
    if (!service) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID: ${id}`);
    }
    return service;
  }

  async updateService(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    // Cập nhật thông tin dịch vụ theo ID và DTO
    const service = await this.serviceModel.findByIdAndUpdate(
      id,
      updateServiceDto,
      {
        new: true,
      },
    );

    if (!service) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID ${id}`);
    }
    return service;
  }

  async removeService(id: string): Promise<ResponseInterface> {
    // Xóa dịch vụ theo ID
    const result = await this.serviceModel.findByIdAndDelete(id);
    if (!result) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy dịch vụ với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Dịch vụ với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
