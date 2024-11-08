import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from './interfaces/banner.interface';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { BannerService } from './banners.service';
import { UpdateBannersStatusDto } from './dto/update-multi-banner.dto';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('banners')
@Controller('api/banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo banner mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Banner đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
  ): Promise<{ data: Banner }> {
    const banner = await this.bannerService.createBanner(createBannerDto);
    return { data: banner };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách banner' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách banner.',
  })
  async findBanners(): Promise<{ data: Banner[] }> {
    const banners = await this.bannerService.findBanners();
    return { data: banners };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin banner theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết banner.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy banner.',
  })
  async findByIdBanner(@Param('id') id: string): Promise<{ data: Banner }> {
    const banner = await this.bannerService.findByIdBanner(id);
    return { data: banner };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin banner theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết banner đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy banner.',
  })
  async updateBanner(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<{ data: Banner }> {
    const banner = await this.bannerService.updateBanner(id, updateBannerDto);
    return { data: banner };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa banner theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Banner đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy banner.',
  })
  async removeBanner(@Param('id') id: string): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.bannerService.removeBanner(id);

    return {
      statusCode,
      message,
      messageCode,
    };
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái cho nhiều banner' })
  @Patch('status')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trạng thái của các banner đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy các banner với ID đã cung cấp.',
  })
  async updateBannersStatus(
    @Body() updateBannersStatusDto: UpdateBannersStatusDto,
  ): Promise<ResponseInterface> {
    return await this.bannerService.updateBannersStatus(updateBannersStatusDto);
  }
}
