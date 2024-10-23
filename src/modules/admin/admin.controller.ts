import { AdminService } from './admin.service';
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
import { Admin, AdminRequest } from './interfaces/admin.interface';
import { LoginAdminDto } from './dto/login-admin.dto';
import { adminAccounts } from 'src/data/admin.accont';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthAdminGuard } from 'src/guards/adminAuth.guard';
import { RefreshTokenAdminDto } from './dto/refreshToken-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { MetaPagination } from 'src/common/constant';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @UseGuards(AuthAdminGuard) // Kiểm tra có phải admin hay không
  @ApiOperation({ summary: 'Tạo quản trị viên mới - ADMIN or MODERATOR' })
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
  async login(@Body() loginDto: LoginAdminDto): Promise<{
    data: Admin;
    token: {
      expiresIn: number;
      accessToken: string;
      refreshToken: string;
      refreshExpiresIn: number;
    };
  }> {
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
  async refreshToken(@Body() refreshTokenAdminDto: RefreshTokenAdminDto) {
    if (!refreshTokenAdminDto) {
      throw new UnauthorizedException('Yêu cầu refresh token');
    }

    return this.adminService.refreshAccessToken(
      refreshTokenAdminDto.refreshToken,
    );
  }

  @Get()
  @UseGuards(AuthAdminGuard)
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
  @UseGuards(AuthAdminGuard)
  @ApiOperation({ summary: 'Lấy danh sách tất cả quản trị viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách quản trị viên.',
  })
  async findAllAdmins(): Promise<{ data: Admin[] }> {
    const admins = await this.adminService.findAllAdmins();
    return { data: admins };
  }

  @Get('auth-me')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'Lấy thông tin cá nhân của quản trị viên bằng access token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết quản trị viên.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quản trị viên.',
  })
  async findAuthMe(@Req() request: AdminRequest): Promise<{ data: Admin }> {
    // Lấy thông tin quản trị viên từ request (được đính kèm trong AuthAdminGuard)
    const auth = request.auth;

    // Trả về thông tin quản trị viên
    return { data: auth };
  }

  @Post('insert-admin/example')
  @ApiExcludeEndpoint() // Để không hiển thị trong Swagger
  async insertAdminsExample(): Promise<ResponseInterface> {
    const response = await this.adminService.insertAdminsExample(adminAccounts);
    return response;
  }

  @Get(':id')
  @UseGuards(AuthAdminGuard)
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
    const admin = await this.adminService.findByIdAdmin(id);
    return { data: admin };
  }

  @Put(':id')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin quản trị viên theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết quản trị viên đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quản trị viên.',
  })
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<{ data: Admin }> {
    const admin = await this.adminService.updateAdmin(id, updateAdminDto);
    return { data: admin };
  }

  @Delete(':id')
  @UseGuards(AuthAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa quản trị viên theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Quản trị viên đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quản trị viên.',
  })
  async removeAdmin(@Param('id') id: string): Promise<ResponseInterface> {
    return this.adminService.removeAdmin(id);
  }
}
