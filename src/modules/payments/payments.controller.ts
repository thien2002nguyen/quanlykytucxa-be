import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
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
  Payment,
  TotalBillInterface,
  VnpayCallbackResponse,
  MomoPaymentResponse,
  MomoPaymentCallback,
} from './interfaces/payments.interface';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { MetaPagination } from 'src/common/constant';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRequest } from 'src/interfaces/request.inrterface';
import { PayBillDto } from './dto/pay-bill.dto';
import { VnpayService } from './vnpay.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MomoService } from './momo.service';
import { CheckStatusPaymentMomoDto } from './dto/check-status-payment-momo.dto';

@ApiBearerAuth()
@ApiTags('payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly vnpayService: VnpayService,
    private readonly momoService: MomoService,
  ) {}

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
  async createPayment(
    @Req() request: UserRequest,
  ): Promise<{ data: ResponseInterface }> {
    const { id } = request.auth;
    const response = await this.paymentsService.createPayments(id);
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
  ): Promise<{ data: Payment[]; meta: MetaPagination }> {
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
  ): Promise<{
    data: Payment[];
    meta: MetaPagination;
    totalBill: TotalBillInterface;
  }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta, totalBill } =
      await this.paymentsService.findPaymentsByUser(
        +page,
        +limit,
        sortDirection,
        filter,
        studentCode,
      );
    return { data, meta, totalBill };
  }

  // Tạo yêu cầu thanh toán VNPAY
  @Post('vnpay/create-payment')
  @ApiOperation({ summary: 'Tạo yêu cầu thanh toán VNPAY' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đường dẫn thanh toán VNPAY',
  })
  async createVnpayPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<{ paymentUrl: string }> {
    const { amount, orderInfo } = createPaymentDto;
    const paymentUrl = await this.vnpayService.createPaymentVNPAY(
      amount,
      orderInfo,
    );
    return { paymentUrl };
  }

  // Xử lý phản hồi từ VNPAY
  @Post('vnpay/callback')
  @ApiOperation({ summary: 'Xử lý callback từ VNPAY' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết quả thanh toán từ VNPAY',
  })
  async handleVnpayCallback(
    @Query() queryParams: Record<string, string>,
  ): Promise<VnpayCallbackResponse> {
    const { status, message, vnpayData } =
      await this.vnpayService.handleVnpayCallback(queryParams);
    return { status, message, vnpayData };
  }

  // Tạo yêu cầu thanh toán Momo
  @Post('momo/create-payment')
  @ApiOperation({ summary: 'Tạo yêu cầu thanh toán MoMo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đường dẫn thanh toán MoMo',
  })
  async createMomoPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<{ data: MomoPaymentResponse }> {
    try {
      const { amount, orderInfo } = createPaymentDto;
      const response = await this.momoService.createPaymentMomo(
        amount,
        orderInfo,
      );
      return { data: response };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Lỗi khi tạo yêu cầu thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Xử lý phản hồi từ momo
  @Post('momo/callback')
  @ApiOperation({ summary: 'Xử lý callback từ MOMO' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Kết quả thanh toán từ MOMO',
  })
  async processMomoCallback(@Body() body: MomoPaymentCallback): Promise<void> {
    return this.momoService.handleMomoCallback(body);
  }

  // Kiểm tra trạng thái giao dịch MoMo
  @Post('momo/check-status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán từ MoMo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin trạng thái thanh toán',
  })
  async checkPaymentStatus(
    @Body() checkStatusPaymentMomoDto: CheckStatusPaymentMomoDto,
  ): Promise<{ data: any }> {
    try {
      const { orderId } = checkStatusPaymentMomoDto;
      const response = await this.momoService.checkPaymentStatus(orderId);
      return { data: response };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Lỗi khi kiểm tra trạng thái thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('pay-bill/:paymentId')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Trả hóa đơn theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết thanh toán.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thanh toán.',
  })
  async payBillById(
    @Param('paymentId') paymentId: string,
    @Body() payBillDto: PayBillDto,
  ): Promise<{ data: Payment }> {
    const payment = await this.paymentsService.payBillById(
      paymentId,
      payBillDto,
    );
    return { data: payment };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin thanh toán theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết thanh toán.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thanh toán.',
  })
  async findByIdPayment(@Param('id') id: string): Promise<{ data: Payment }> {
    const payment = await this.paymentsService.findByIdPayment(id);
    return { data: payment };
  }
}
