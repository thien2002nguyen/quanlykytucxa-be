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
import { ContractsService } from './contracts.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateContractDto } from './dto/create-contract.dto';
import { Contract } from './interfaces/contracts.interface';
import { MetaPagination } from 'src/common/constant';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { StatusEnum } from './interfaces/contracts.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRequest } from 'src/interfaces/request.inrterface';
import { CreateServiceContractDto } from './dto/create-service-contract.dto';

@ApiBearerAuth()
@ApiTags('contracts')
@Controller('api/contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Tạo hợp đồng mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hợp đồng đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createContract(
    @Body() createContractDto: CreateContractDto,
  ): Promise<{ data: Contract }> {
    const contract =
      await this.contractsService.createContract(createContractDto);
    return { data: contract };
  }

  @Get()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({
    summary: 'Lấy danh sách hợp đồng với phân trang, tìm kiếm và lọc',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách hợp đồng.' })
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
    name: 'filter',
    type: String,
    required: false,
    enum: StatusEnum,
  })
  async findContracts(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
    @Query('filter') filter?: StatusEnum,
  ): Promise<{ data: Contract[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.contractsService.findContracts(
      +page,
      +limit,
      search,
      sortDirection,
      filter,
    );
    return { data, meta };
  }

  @Put(':id/confirm')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Duyệt hợp đồng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hợp đồng đã được xác nhận thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  async confirmContract(
    @Req() request: UserRequest,
    @Param('id') id: string,
  ): Promise<{ data: Contract }> {
    const contract = await this.contractsService.confirmContract(
      id,
      request.auth.id,
    );
    return { data: contract };
  }

  @Put(':id/request-cancel')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Gửi yêu cầu hủy hợp đồng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gửi yêu cầu hủy hợp đồng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Hợp đồng không thể hủy do trạng thái hiện tại không cho phép.',
  })
  async requestCancelContract(
    @Param('id') id: string,
  ): Promise<{ data: Contract }> {
    const contract = await this.contractsService.requestCancelContract(id);
    return { data: contract };
  }

  @Put(':id/cancel')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Hủy hợp đồng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hủy hợp đồng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Hợp đồng không thể hủy do trạng thái hiện tại không cho phép.',
  })
  async cancelContract(@Param('id') id: string): Promise<{ data: Contract }> {
    const contract = await this.contractsService.cancelContract(id);
    return { data: contract };
  }

  @Put(':id/check-in-date')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật ngày nhận phòng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật ngày nhận phòng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Trạng thái hợp đồng không cho phép cập nhật ngày nhận phòng.',
  })
  async updateCheckInDate(
    @Param('id') id: string,
  ): Promise<{ data: Contract }> {
    const contract = await this.contractsService.updateCheckInDate(id);
    return { data: contract };
  }

  @Put(':id/check-out-date')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật ngày trả phòng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật ngày trả phòng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Chưa nhận phòng.',
  })
  async updateCheckOutDate(
    @Param('id') id: string,
  ): Promise<{ data: Contract }> {
    const contract = await this.contractsService.updateCheckOutDate(id);
    return { data: contract };
  }

  @Post(':contractId/register-room-service')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Đăng ký dịch vụ phòng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng ký dịch vụ thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  async addServiceToContract(
    @Param('contractId') contractId: string,
    @Body() createServiceDto: CreateServiceContractDto,
  ): Promise<{ data: Contract }> {
    const updatedContract = await this.contractsService.addService(
      contractId,
      createServiceDto,
    );
    return { data: updatedContract };
  }

  @Delete(':contractId/remove-service/:serviceId')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Hủy dịch vụ trong hợp đồng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hủy dịch vụ thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng hoặc dịch vụ.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  async removeServiceFromContract(
    @Param('contractId') contractId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<{ data: Contract }> {
    const updatedContract = await this.contractsService.removeService(
      contractId,
      serviceId,
    );
    return { data: updatedContract };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin hợp đồng theo ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết hợp đồng.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  async findByIdContract(@Param('id') id: string): Promise<{ data: Contract }> {
    const contract = await this.contractsService.findByIdContract(id);
    return { data: contract };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa hợp đồng theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Hợp đồng đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy hợp đồng.',
  })
  async removeContract(
    @Param('id') id: string,
  ): Promise<{ statusCode: number; message: string }> {
    const { statusCode, message } =
      await this.contractsService.removeContract(id);
    return { statusCode, message };
  }
}
