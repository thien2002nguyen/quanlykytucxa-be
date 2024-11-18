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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';
import { Student } from './interfaces/students.interface';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { MetaPagination } from 'src/common/constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { UserRequest } from 'src/interfaces/request.inrterface';

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
  @UseGuards(AuthGuard)
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
  async findAuthMe(@Req() request: UserRequest): Promise<{ data: Student }> {
    const student = await this.studentsService.findAuthMe(request.auth.id);
    return { data: student };
  }

  @Post('import-file')
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseInterface> {
    if (!file) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Vui lòng tải lên một tệp.',
        messageCode: 'FILE_NOT_PROVIDED',
      });
    }

    const { buffer, mimetype } = file;
    const fileExtension = mimetype === 'text/csv' ? 'csv' : 'xlsx';

    return this.studentsService.importStudents(buffer, fileExtension);
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
