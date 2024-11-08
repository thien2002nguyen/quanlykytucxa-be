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
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './interfaces/service.interface';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('services')
@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo dịch vụ mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dịch vụ đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createService(
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<{ data: Service }> {
    const service = await this.servicesService.createService(createServiceDto);
    return { data: service };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách dịch vụ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách dịch vụ.',
  })
  async findServices(): Promise<{ data: Service[] }> {
    const services = await this.servicesService.findServices();
    return { data: services };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin dịch vụ theo ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết dịch vụ.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ.',
  })
  async findByIdService(@Param('id') id: string): Promise<{ data: Service }> {
    const service = await this.servicesService.findByIdService(id);
    return { data: service };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin dịch vụ theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết dịch vụ đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ.',
  })
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<{ data: Service }> {
    const service = await this.servicesService.updateService(
      id,
      updateServiceDto,
    );
    return { data: service };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa dịch vụ theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Dịch vụ đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dịch vụ.',
  })
  async removeService(@Param('id') id: string): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.servicesService.removeService(id);

    return {
      statusCode,
      message,
      messageCode,
    };
  }
}
