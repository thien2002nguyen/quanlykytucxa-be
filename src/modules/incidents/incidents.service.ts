import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Incident, IncidentStatus } from './interfaces/incident.interface';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { MetaPagination } from 'src/common/constant';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel('Incident') private readonly incidentModel: Model<Incident>,
  ) {}

  async createIncident(
    userId: string,
    createIncidentDto: CreateIncidentDto,
  ): Promise<Incident> {
    // Lưu sự cố mới
    return this.incidentModel.create({
      ...createIncidentDto,
      userId,
    });
  }

  async findIncidents(
    page: number,
    limit: number,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Incident[]; meta: MetaPagination }> {
    const sortDirections: { [field: string]: 'asc' | 'desc' } = {
      createdAt: sortDirection, // Sử dụng 'asc' hoặc 'desc' để phân loại
    };

    // Xây dựng các tùy chọn phân trang
    const { skip, limit: pageLimit } = paginateQuery(page, limit);

    // Xây dựng các tùy chọn sắp xếp
    const sortOptions = getSortOptions(sortDirections);

    // Tìm kiếm tài liệu
    const query = this.incidentModel
      .find()
      .populate('userId', 'userName')
      .populate('adminId', 'userName');

    // Đếm tổng số tài liệu phù hợp
    const total = await this.incidentModel.countDocuments();

    // Phân trang và sắp xếp
    const incidents = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: incidents, meta };
  }

  async findByIdIncident(id: string): Promise<Incident> {
    // Kiểm tra xem id có phải là một ObjectId hợp lệ hay không
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const incident = await this.incidentModel
      .findById(id)
      .populate('userId', 'userName')
      .populate('adminId', 'userName');

    if (!incident) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Không tìm thấy sự cố.',
        messageCode: 'INCIDENT_NOT_FOUND',
      });
    }

    return incident;
  }

  async updateIncident(
    adminId: string,
    id: string,
    updateIncidentDto: UpdateIncidentDto,
  ): Promise<Incident> {
    let incident;

    const { status } = updateIncidentDto;
    if (status === IncidentStatus.RESOLVED) {
      // Cập nhật thông tin sự cố theo ID và DTO
      incident = await this.incidentModel.findByIdAndUpdate(
        id,
        { ...updateIncidentDto, adminId, resolvedAt: new Date().toISOString() },
        {
          new: true,
        },
      );
    } else {
      // Cập nhật thông tin sự cố theo ID và DTO
      incident = await this.incidentModel.findByIdAndUpdate(
        id,
        { ...updateIncidentDto, adminId },
        {
          new: true,
        },
      );
    }

    if (!incident) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy sự cố với ID ${id}`);
    }

    return incident;
  }

  @Cron('0 0 1 */2 *') // Chạy vào 0:00 ngày 1 của các tháng chẵn
  async removeAllIncident(): Promise<void> {
    // Xóa tất cả các sự cố trong cơ sở dữ liệu
    await this.incidentModel.deleteMany();
  }
}
