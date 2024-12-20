import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaymentStatusEnum,
  PaymentType,
} from './interfaces/payments.interface';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { MetaPagination } from 'src/common/constant';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiBearerAuth()
@ApiTags('payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo hóa đơn tháng' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hóa đơn đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createPayment(): Promise<{ data: ResponseInterface }> {
    const response = await this.paymentsService.createPayments();
    return { data: response };
  }

  @Get()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({
    summary: 'Lấy danh sách thanh toán với phân trang, tìm kiếm và lọc',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách thanh toán.' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'sort', type: String, required: false })
  @ApiQuery({
    name: 'filter',
    type: String,
    required: false,
    enum: PaymentStatusEnum,
  }) // Enum lọc
  async findPayments(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
    @Query('filter') filter: PaymentStatusEnum,
  ): Promise<{ data: PaymentType[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.paymentsService.findPayments(
      +page,
      +limit,
      search,
      sortDirection,
      filter,
    );
    return { data, meta };
  }

  @Get('/by-user')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách thanh toán với phân trang, tìm kiếm và lọc',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách thanh toán.' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'sort', type: String, required: false })
  @ApiQuery({
    name: 'filter',
    type: String,
    required: false,
    enum: PaymentStatusEnum,
  }) // Enum lọc
  @ApiQuery({ name: 'studentCode', type: String, required: true }) // Tìm theo mã số sinh viên
  async findPaymentsByUser(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('sort') sort = 'desc',
    @Query('filter') filter: PaymentStatusEnum,
    @Query('studentCode') studentCode: string,
  ): Promise<{ data: PaymentType[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.paymentsService.findPaymentsByUser(
      +page,
      +limit,
      sortDirection,
      filter,
      studentCode,
    );
    return { data, meta };
  }

  @Get(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Lấy thông tin thanh toán theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết thanh toán.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thanh toán.',
  })
  async findByIdPayment(
    @Param('id') id: string,
  ): Promise<{ data: PaymentType }> {
    const payment = await this.paymentsService.findByIdPayment(id);
    return { data: payment };
  }
}
