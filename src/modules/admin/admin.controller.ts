import { AdminService } from './admin.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from './interfaces/admin.interface';
import { LoginAdminDto } from './dto/login-admin.dto';
import { adminAccounts } from 'src/data/admin.accont';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { MetaPagination } from 'src/config/constant';
import { RefreshTokenDto } from './dto/refreshToken-admin.dto';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @UseGuards(AuthGuard) // Kiểm tra có phải admin hay không
  @ApiOperation({ summary: 'Tạo quản trị viên mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Quản trị viên đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<{ data: Admin }> {
    const admin = await this.adminService.createAdmin(createAdminDto);
    return { data: admin };
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập quản trị viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Thông tin đăng nhập không chính xác.',
  })
  async login(
    @Body() loginDto: LoginAdminDto,
  ): Promise<{ data: Admin; accessToken: string; refreshToken: string }> {
    return await this.adminService.login({
      userName: loginDto.userName,
      password: loginDto.password,
    });
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Lấy lại access token từ refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token đã được tạo lại thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto) {
      throw new UnauthorizedException('Yêu cầu refresh token');
    }

    return this.adminService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách quản trị viên với phân trang và tìm kiếm',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách quản trị viên.',
  })
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
    type: 'String',
    required: false,
  })
  async findAdmins(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
  ): Promise<{ data: Admin[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.adminService.findAdmins(
      +page,
      +limit,
      search,
      sortDirection,
    );
    return { data, meta };
  }

  @Get('/all')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách tất cả quản trị viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách quản trị viên.',
  })
  async findAllAdmins(): Promise<{ data: Admin[] }> {
    const admins = await this.adminService.findAllAdmins();
    return { data: admins };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin quản trị viên theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết quản trị viên.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quản trị viên.',
  })
  async findByIdAdmin(@Param('id') id: string): Promise<{ data: Admin }> {
    const student = await this.adminService.findByIdAdmin(id);
    return { data: student };
  }

  @Post('insert-admin/example')
  @ApiExcludeEndpoint() // Để không hiển thị trong Swagger
  async insertAdminsExample(): Promise<ResponseInterface> {
    const response = await this.adminService.insertAdminsExample(adminAccounts);
    return response;
  }
}
