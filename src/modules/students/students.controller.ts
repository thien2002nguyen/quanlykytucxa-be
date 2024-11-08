import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';
import { Student, StudentRequest } from './interfaces/students.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { StudentAuthGuard } from 'src/guards/studentAuth.guard';
import { LoginStudentDto } from './dto/login-student.dto';
import { RefreshTokenStudentDto } from './dto/refreshToken-student.dto';
import { studentAccounts } from 'src/data/student.accont';
import { MetaPagination } from 'src/common/constant';

@ApiBearerAuth()
@ApiTags('students')
@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo sinh viên mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sinh viên đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createStudent(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<{ data: Student }> {
    const student = await this.studentsService.createStudent(createStudentDto);
    return { data: student };
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập sinh viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Thông tin đăng nhập không chính xác.',
  })
  async login(@Body() loginDto: LoginStudentDto): Promise<{
    data: Student;
    token: {
      accessToken: string;
      refreshToken: string;
      refreshExpiresIn: string;
    };
  }> {
    return await this.studentsService.login({
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
  async refreshToken(@Body() refreshTokenStudentDto: RefreshTokenStudentDto) {
    if (!refreshTokenStudentDto) {
      throw new UnauthorizedException('Yêu cầu refresh token');
    }

    return this.studentsService.refreshAccessToken(
      refreshTokenStudentDto.refreshToken,
    );
  }

  @Get()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({
    summary: 'Lấy danh sách sinh viên với phân trang và tìm kiếm',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách sinh viên.' })
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
  async findStudents(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
  ): Promise<{ data: Student[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.studentsService.findStudents(
      +page,
      +limit,
      search,
      sortDirection,
    );
    return { data, meta };
  }

  @Get('auth-me')
  @UseGuards(StudentAuthGuard)
  @ApiOperation({
    summary: 'Lấy thông tin cá nhân của sinh viên bằng access token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async findAuthMe(@Req() request: StudentRequest): Promise<{ data: Student }> {
    const student = request.student;

    return { data: student };
  }

  @Get('/all')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Lấy danh sách tất cả sinh viên' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách sinh viên.' })
  async findAllStudents(): Promise<{ data: Student[] }> {
    const students = await this.studentsService.findAllStudents();
    return { data: students };
  }

  @Post('insert-students/example')
  @ApiExcludeEndpoint() // Để không hiển thị trong Swagger
  async insertStudentsExample(): Promise<ResponseInterface> {
    const response =
      await this.studentsService.insertStudentsExample(studentAccounts);
    return response;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sinh viên theo ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết sinh viên.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async findByIdStudent(@Param('id') id: string): Promise<{ data: Student }> {
    const student = await this.studentsService.findByIdStudent(id);
    return { data: student };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin sinh viên theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết sinh viên đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async updateStudent(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<{ data: Student }> {
    const student = await this.studentsService.updateStudent(
      id,
      updateStudentDto,
    );
    return { data: student };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa sinh viên theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Sinh viên đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async removeStudent(@Param('id') id: string): Promise<ResponseInterface> {
    return this.studentsService.removeStudent(id);
  }
}
