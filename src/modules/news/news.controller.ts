import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { News } from './interfaces/news.interface';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { MetaPagination } from 'src/common/constant';
import { UserRequest } from 'src/interfaces/request.inrterface';

@ApiBearerAuth()
@ApiTags('news')
@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bài viết đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createNews(
    @Req() request: UserRequest,
    @Body() createNewsDto: CreateNewsDto,
  ): Promise<{ data: News }> {
    const auth = request.auth;
    const news = await this.newsService.createNews(
      auth._id as string,
      createNewsDto,
    );
    return { data: news };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách bài viết với phân trang và tìm kiếm',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách bài viết.' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'isClient',
    type: Boolean,
    required: false,
  })
  async findNews(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
    @Query('isClient') isClient: boolean = false,
  ): Promise<{ data: News[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.newsService.findNews(
      +page,
      +limit,
      search,
      sortDirection,
      isClient,
    );
    return { data, meta };
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Lấy thông tin tin tức theo ID hoặc Slug' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết tin tức.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy tin tức.',
  })
  async findOneNews(
    @Param('idOrSlug') idOrSlug: string,
  ): Promise<{ data: News }> {
    const news = await this.newsService.findOneNews(idOrSlug);
    return { data: news };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin bài viết theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bài viết đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy bài viết.',
  })
  async updateNews(
    @Req() request: UserRequest,
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
  ): Promise<{ data: News }> {
    const auth = request.auth;
    const news = await this.newsService.updateNews(
      auth._id as string,
      id,
      updateNewsDto,
    );
    return { data: news };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa bài viết theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Bài viết đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy bài viết.',
  })
  async removeNews(@Param('id') id: string): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.newsService.removeNews(id);
    return { statusCode, message, messageCode };
  }
}
