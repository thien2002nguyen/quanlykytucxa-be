import { UsersService } from './users.service';
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
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthAdminGuard } from 'src/guards/adminAuth.guard';
import { MetaPagination } from 'src/common/constant';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseInterface, User } from './interfaces/user.interface';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { accountsExample } from 'src/data/accountsExample';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRequest } from 'src/interfaces/request.inrterface';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ChangePasswordDto } from './dto/changePasswordDto.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Gửi OTP thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseInterface> {
    const response = await this.usersService.register(registerDto);
    return response;
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Xác thực mã OTP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mã OTP đã được xác thực thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Mã OTP không đúng hoặc đã hết hạn.',
  })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{ otpVerified: boolean; data: User }> {
    return await this.usersService.verifyOtp(verifyOtpDto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Thay đổi mật khẩu người dùng.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hoàn tất thay đổi mật khẩu người dùng.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Người dùng không tồn tại hoặc thông tin không hợp lệ.',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ data: any }> {
    const user = await this.usersService.changePassword(changePasswordDto);
    return { data: user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Thông tin đăng nhập không chính xác.',
  })
  async login(@Body() loginDto: LoginDto): Promise<{
    data: User;
    token: {
      accessToken: string;
      refreshToken: string;
      refreshExpiresIn: number;
    };
  }> {
    return await this.usersService.login({
      userName: loginDto.userName,
      password: loginDto.password,
    });
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Lấy lại access token' })
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

    return this.usersService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Get()
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'Lấy danh sách tài khoản với phân trang và tìm kiếm',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách tài khoản.',
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
  async findUsers(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
  ): Promise<{ data: User[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.usersService.findUsers(
      +page,
      +limit,
      search,
      sortDirection,
    );
    return { data, meta };
  }

  @Get('auth-me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin tài khoản.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy tài khoản.',
  })
  async findAuthMe(@Req() request: UserRequest): Promise<{ data: User }> {
    // Lấy thông tin tài khoản từ request (được đính kèm trong AuthGuard)
    const auth = request.auth;

    // Trả về thông tin tài khoản
    return { data: auth };
  }

  @Post('insert-user/example')
  @ApiExcludeEndpoint() // Để không hiển thị trong Swagger
  async insertUsersExample(): Promise<ResponseInterface> {
    const response =
      await this.usersService.insertUsersExample(accountsExample);
    return response;
  }

  @Get(':id')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết người dùng.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng.',
  })
  async findByIdUser(@Param('id') id: string): Promise<{ data: User }> {
    const user = await this.usersService.findByIdUser(id);
    return { data: user };
  }

  @Put(':id')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết người dùng đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng.',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ data: User }> {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return { data: user };
  }

  @Delete(':id')
  @UseGuards(AuthAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa người dùng theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Người dùng đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng.',
  })
  async removeUser(@Param('id') id: string): Promise<ResponseInterface> {
    return this.usersService.removeUser(id);
  }
}
