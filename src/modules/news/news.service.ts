import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { News } from './interfaces/news.interface';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import slugify from 'slugify';

@Injectable()
export class NewsService {
  constructor(@InjectModel('News') private readonly newsModel: Model<News>) {}

  async createNews(
    adminId: string,
    createNewsDto: CreateNewsDto,
  ): Promise<News> {
    const { title } = createNewsDto;
    let newsSlug: string;
    let attempts = 0;

    while (attempts < 3) {
      newsSlug = slugify(`${title}-${Math.floor(Math.random() * 10001)}`, {
        lower: true,
        locale: 'vi',
      });

      const existingNews = await this.newsModel.findOne({ slug: newsSlug });

      if (!existingNews) {
        const newNews = await this.newsModel.create({
          ...createNewsDto,
          adminId,
          slug: newsSlug,
        });
        return newNews;
      }

      attempts++;
    }

    throw new BadRequestException(
      'Có một số lỗi xảy ra, vui lòng thử lại sau.',
    );
  }

  async findNews(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
    isClient: boolean = false,
  ): Promise<{ data: News[]; meta: MetaPagination }> {
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

    const query = this.newsModel
      .find(searchQuery)
      .populate('adminId', 'userName');

    const total = await this.newsModel.countDocuments(searchQuery);
    const news = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: news, meta };
  }

  async findOneNews(idOrSlug: string): Promise<News> {
    let news;

    // Kiểm tra xem idOrSlug có phải là một ObjectId hợp lệ hay không
    if (Types.ObjectId.isValid(idOrSlug)) {
      // Nếu là ObjectId hợp lệ, tìm kiếm theo ID
      news = await this.newsModel.findById(idOrSlug);
    }

    // Nếu không tìm thấy theo ID hoặc không phải ObjectId, tìm theo slug
    if (!news) {
      news = await this.newsModel.findOne({ slug: idOrSlug });
    }

    // Nếu không tìm thấy cả theo ID và slug, ném ra lỗi
    if (!news) {
      throw new NotFoundException(
        `Không tìm thấy tin tức với ID hoặc slug: ${idOrSlug}`,
      );
    }

    return news;
  }

  async updateNews(
    adminId: string,
    id: string,
    updateNewsDto: UpdateNewsDto,
  ): Promise<News> {
    const news = await this.newsModel.findByIdAndUpdate(
      id,
      {
        ...updateNewsDto,
        adminId,
      },
      {
        new: true,
      },
    );

    if (!news) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }
    return news;
  }

  async removeNews(id: string): Promise<ResponseInterface> {
    const result = await this.newsModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Bài viết với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
