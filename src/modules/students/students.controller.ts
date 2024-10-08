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
import { MetaPagination } from 'src/config/constant';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiBearerAuth()
@ApiTags('students')
@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(AuthGuard)
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

  @Get('/all')
  @ApiOperation({ summary: 'Lấy danh sách tất cả sinh viên' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách sinh viên.' })
  async findAllStudents(): Promise<{ data: Student[] }> {
    const students = await this.studentsService.findAllStudents();
    return { data: students };
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa sinh viên theo ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Sinh viên đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async removeStudent(@Param('id') id: string): Promise<void> {
    return this.studentsService.removeStudent(id);
  }
}
