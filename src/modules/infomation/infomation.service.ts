import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Infomation } from './interfaces/infomation.interface';
import { CreateInfomationDto } from './dto/create-infomation.dto';
import { UpdateInfomationDto } from './dto/update-infomation.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import slugify from 'slugify';

@Injectable()
export class InfomationService {
  constructor(
    @InjectModel('Infomation')
    private readonly infomationModel: Model<Infomation>,
  ) {}

  async createInfomation(
    adminId: string,
    createInfomationDto: CreateInfomationDto,
  ): Promise<Infomation> {
    const { title } = createInfomationDto;
    let infomationSlug: string;
    let attempts = 0;

    while (attempts < 3) {
      infomationSlug = slugify(
        `${title}-${Math.floor(Math.random() * 10001)}`,
        {
          lower: true,
          locale: 'vi',
        },
      );

      const existingInfomation = await this.infomationModel.findOne({
        slug: infomationSlug,
      });

      if (!existingInfomation) {
        const newInfomation = await this.infomationModel.create({
          ...createInfomationDto,
          adminId,
          slug: infomationSlug,
        });
        return newInfomation;
      }

      attempts++;
    }

    throw new BadRequestException(
      'Có một số lỗi xảy ra, vui lòng thử lại sau.',
    );
  }

  async findInfomations(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
    isClient: boolean = false,
  ): Promise<{ data: Infomation[]; meta: MetaPagination }> {
    const searchQuery: { [key: string]: any } = buildSearchQuery({
      fields: ['title'], // Tìm kiếm trong các trường title
      searchTerm: search,
    });

    // Thêm điều kiện lọc nếu isClient = true
    if (isClient) {
      searchQuery.isActive = true;
    }

    const sortDirections: { [field: string]: 'asc' | 'desc' } = {
      createdAt: sortDirection,
    };

    const { skip, limit: pageLimit } = paginateQuery(page, limit);
    const sortOptions = getSortOptions(sortDirections);

    const query = this.infomationModel
      .find(searchQuery)
      .populate('adminId', 'userName email phoneNumber');

    const total = await this.infomationModel.countDocuments(searchQuery);
    const infomations = await query
      .skip(skip)
      .limit(pageLimit)
      .sort(sortOptions);

    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: infomations, meta };
  }

  async findOneInfomation(idOrSlug: string): Promise<Infomation> {
    let infomation;

    if (Types.ObjectId.isValid(idOrSlug)) {
      infomation = await this.infomationModel.findById(idOrSlug);
    }

    if (!infomation) {
      infomation = await this.infomationModel.findOne({ slug: idOrSlug });
    }

    if (!infomation) {
      throw new NotFoundException(
        `Không tìm thấy thông tin với ID hoặc slug: ${idOrSlug}`,
      );
    }

    return infomation;
  }

  async updateInfomation(
    adminId: string,
    id: string,
    updateInfomationDto: UpdateInfomationDto,
  ): Promise<Infomation> {
    const infomation = await this.infomationModel.findByIdAndUpdate(
      id,
      {
        ...updateInfomationDto,
        adminId,
      },
      {
        new: true,
      },
    );

    if (!infomation) {
      throw new NotFoundException(`Không tìm thấy thông tin với ID ${id}`);
    }
    return infomation;
  }

  async removeInfomation(id: string): Promise<ResponseInterface> {
    const result = await this.infomationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy thông tin với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Thông tin với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
