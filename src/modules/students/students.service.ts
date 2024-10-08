import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './interfaces/students.interface';
import { MetaPagination } from 'src/config/constant';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { ResponseInterface } from 'src/interfaces/response.interface';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel('Student') private readonly studentModel: Model<Student>,
  ) {}

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const { studentId, nationalIdCard, email, phoneNumber } = createStudentDto;

    // Kiểm tra tính duy nhất của studentId
    const existingStudentById = await this.studentModel.findOne({ studentId });
    if (existingStudentById) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Mã sinh viên đã tồn tại.',
        messageCode: 'STUDENT_ID_EXISTED',
      });
    }

    // Kiểm tra tính duy nhất của nationalIdCard
    const existingStudentByNationalIdCard = await this.studentModel.findOne({
      nationalIdCard,
    });
    if (existingStudentByNationalIdCard) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Sinh viên đã tồn tại.',
        messageCode: 'STUDENT_EXISTED',
      });
    }

    // Kiểm tra tính duy nhất của email
    const existingStudentByEmail = await this.studentModel.findOne({ email });
    if (existingStudentByEmail) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Email đã tồn tại.',
        messageCode: 'EMAIL_EXISTED',
      });
    }

    // Kiểm tra tính duy nhất của số điện thoại
    const existingStudentByPhone = await this.studentModel.findOne({
      phoneNumber,
    });
    if (existingStudentByPhone) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Số điện thoại đã tồn tại.',
        messageCode: 'PHONE_NUMBER_EXISTED',
      });
    }

    // Nếu không có sinh viên nào trùng, tiếp tục tạo sinh viên mới
    return this.studentModel.create(createStudentDto);
  }

  async findStudents(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Student[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery = buildSearchQuery({
      fields: ['fullName'],
      searchTerm: search,
    });

    const sortDirections: { [field: string]: 'asc' | 'desc' } = {
      createdAt: sortDirection, // Sử dụng 'asc' hoặc 'desc' để phân loại
    };

    // Xây dựng các tùy chọn phân trang
    const { skip, limit: pageLimit } = paginateQuery(page, limit);

    // Xây dựng các tùy chọn sắp xếp
    const sortOptions = getSortOptions(sortDirections);

    // Tìm kiếm tài liệu
    const query = this.studentModel.find(searchQuery);

    // Đếm tổng số tài liệu phù hợp
    const total = await this.studentModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp
    const students = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: students, meta };
  }

  async findAllStudents(): Promise<Student[]> {
    // Lấy tất cả sinh viên từ cơ sở dữ liệu
    return this.studentModel.find();
  }

  async findByIdStudent(id: string): Promise<Student> {
    // Kiểm tra xem id có phải là một ObjectId hợp lệ không
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    // Tìm sinh viên theo ID
    const student = await this.studentModel.findById(id);
    if (!student) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy sinh viên với ID: ${id}`);
    }
    return student;
  }

  async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    // Cập nhật thông tin sinh viên theo ID và DTO
    const student = await this.studentModel.findByIdAndUpdate(
      id,
      updateStudentDto,
      { new: true },
    );

    if (!student) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
    return student;
  }

  async removeStudent(id: string): Promise<ResponseInterface> {
    // Xóa sinh viên theo ID
    const result = await this.studentModel.findByIdAndDelete(id);
    if (!result) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Sinh viên với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
