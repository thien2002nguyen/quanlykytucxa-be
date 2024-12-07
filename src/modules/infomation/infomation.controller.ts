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
import { InfomationService } from './infomation.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Infomation } from './interfaces/infomation.interface';
import { CreateInfomationDto } from './dto/create-infomation.dto';
import { UpdateInfomationDto } from './dto/update-infomation.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { MetaPagination } from 'src/common/constant';
import { UserRequest } from 'src/interfaces/request.inrterface';

@ApiBearerAuth()
@ApiTags('infomations')
@Controller('api/infomations')
export class InfomationController {
  constructor(private readonly infomationService: InfomationService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo thông tin mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Thông tin đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createInfomation(
    @Req() request: UserRequest,
    @Body() createInfomationDto: CreateInfomationDto,
  ): Promise<{ data: Infomation }> {
    const auth = request.auth;
    const infomation = await this.infomationService.createInfomation(
      auth._id as string,
      createInfomationDto,
    );
    return { data: infomation };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách thông tin với phân trang và tìm kiếm',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách thông tin.' })
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
  async findInfomations(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
    @Query('isClient') isClient: boolean = false,
  ): Promise<{ data: Infomation[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.infomationService.findInfomations(
      +page,
      +limit,
      search,
      sortDirection,
      isClient,
    );
    return { data, meta };
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Lấy thông tin thông tin theo ID hoặc Slug' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết thông tin.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông tin.',
  })
  async findOneInfomation(
    @Param('idOrSlug') idOrSlug: string,
  ): Promise<{ data: Infomation }> {
    const infomation = await this.infomationService.findOneInfomation(idOrSlug);
    return { data: infomation };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin thông tin theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông tin.',
  })
  async updateInfomation(
    @Req() request: UserRequest,
    @Param('id') id: string,
    @Body() updateInfomationDto: UpdateInfomationDto,
  ): Promise<{ data: Infomation }> {
    const auth = request.auth;
    const infomation = await this.infomationService.updateInfomation(
      auth._id as string,
      id,
      updateInfomationDto,
    );
    return { data: infomation };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa thông tin theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Thông tin đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông tin.',
  })
  async removeInfomation(@Param('id') id: string): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.infomationService.removeInfomation(id);
    return { statusCode, message, messageCode };
  }
}
