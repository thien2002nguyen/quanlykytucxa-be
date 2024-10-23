import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentAccount } from './interfaces/students.interface';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { ResponseInterface } from 'src/interfaces/response.interface';
import * as bcrypt from 'bcrypt';
import { TypeLogin } from 'src/interfaces/login.interfaces';
import {
  generateAccessStudentToken,
  generateRefreshStudentToken,
  verifyStudentToken,
} from 'src/utils/tokenUtils';
import { parseExpiration } from 'src/utils/expirationUtils';
import { MetaPagination } from 'src/common/constant';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel('Student') private readonly studentModel: Model<Student>,
  ) {}

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const {
      fullName,
      studentId,
      nationalIdCard,
      email,
      phoneNumber,
      password,
    } = createStudentDto;

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

    // Băm mật khẩu: nếu password tồn tại thì băm nó, nếu không tạo mật khẩu mặc định
    let hashedPassword: string;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Băm mật khẩu được cung cấp
    } else {
      const rawPassword = `${fullName.replace(/\s+/g, '').toLowerCase()}@${studentId}`;
      hashedPassword = await bcrypt.hash(rawPassword, 10); // Băm mật khẩu mặc định
    }

    // Tạo sinh viên mới và lưu mật khẩu đã băm
    const newStudent = await this.studentModel.create({
      ...createStudentDto,
      password: hashedPassword, // Lưu mật khẩu đã băm
    });

    // Chuyển đổi đối tượng và loại bỏ trường `password`
    const studentData = (await newStudent).toObject();
    delete studentData.password; // Xóa trường password

    return studentData;
  }

  async login({ userName, password }: TypeLogin): Promise<{
    data: Student;
    token: {
      expiresIn: number; // Thời gian còn lại của accessToken
      accessToken: string;
      refreshToken: string;
      refreshExpiresIn: number; // Thời gian còn lại của refreshToken
    };
  }> {
    const student = await this.studentModel.findOne({ studentId: userName });

    if (!student) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Thông tin đăng nhập không chính xác.',
        messageCode: 'INVALID_CREDENTIALS',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Thông tin đăng nhập không chính xác.',
        messageCode: 'INVALID_CREDENTIALS',
      });
    }

    // Tạo access token và refresh token
    const accessToken = generateAccessStudentToken(student._id.toString());
    const refreshToken = generateRefreshStudentToken(student._id.toString());

    // Lưu refresh token vào cơ sở dữ liệu
    student.refreshToken = refreshToken;
    await student.save();

    // Chuyển đổi đối tượng và loại bỏ trường `password`
    const studentData = student.toObject();
    delete studentData.password; // Xóa trường password
    delete studentData.refreshToken; // Xóa trường refreshToken

    const ACCESS_TOKEN_EXPIRATION = parseExpiration(
      process.env.ACCESS_TOKEN_EXPIRATION || '1d',
    );
    const REFRESH_TOKEN_EXPIRATION = parseExpiration(
      process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    );

    // Trả về thông tin admin cùng với token và expiresIn
    return {
      data: studentData,
      token: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRATION, // Thời gian tồn tại của access token
        refreshExpiresIn: REFRESH_TOKEN_EXPIRATION, // Thời gian tồn tại của refresh token
      },
    };
  }

  async refreshAccessToken(refreshTokenStudentDto: string): Promise<{
    accessToken: string;
  }> {
    // Kiểm tra tính hợp lệ của refreshTokenStudentDto
    const decoded = verifyStudentToken(refreshTokenStudentDto);

    // Tìm student dựa trên decoded thông tin (id) từ refreshTokenStudentDto
    const student = await this.studentModel.findById(decoded.id);
    if (!student) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Không tìm thấy sinh viên.',
        messageCode: 'STUDENT_NOT_FOUND',
      });
    }

    // Kiểm tra xem refreshToken trong database có khớp không
    if (student.refreshToken !== refreshTokenStudentDto) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Refresh token không hợp lệ.',
        messageCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Tạo mới access token
    const accessToken = generateAccessStudentToken(student._id.toString());

    return { accessToken };
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
    const students = await query
      .skip(skip)
      .limit(pageLimit)
      .sort(sortOptions)
      .select('-password -refreshToken');
    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: students, meta };
  }

  async findAllStudents(): Promise<Student[]> {
    // Lấy tất cả sinh viên từ cơ sở dữ liệu
    return this.studentModel.find().select('-password -refreshToken');
  }

  async findByIdStudent(id: string): Promise<Student> {
    // Kiểm tra xem id có phải là một ObjectId hợp lệ không
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    // Tìm sinh viên theo ID
    const student = await this.studentModel
      .findById(id)
      .select('-password -refreshToken');
    if (!student) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy sinh viên với ID: ${id}`);
    }
    return student;
  }

  async insertStudentsExample(
    studentAccounts: StudentAccount[],
  ): Promise<ResponseInterface> {
    // Tạo mảng các Promise từ các cuộc gọi đến createStudent
    const studentPromises = studentAccounts.map(async (student) => {
      const hashedPassword = await bcrypt.hash(student.password, 10);

      return this.studentModel.create({
        fullName: student.fullName,
        studentId: student.studentId,
        nationalIdCard: student.nationalIdCard,
        phoneNumber: student.phoneNumber,
        email: student.email,
        password: hashedPassword,
        course: student.course,
        class: student.class,
        faculty: student.faculty,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        contactAddress: student.contactAddress,
        avatar: student.avatar, // Nếu có ảnh đại diện
        roomId: student.roomId, // Nếu có phòng ở
      });
    });

    // Chờ tất cả Promise hoàn thành
    await Promise.all(studentPromises);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tất cả tài khoản sinh viên mẫu đã được thêm thành công.',
      messageCode: 'INSERT_SUCCESS',
    };
  }

  async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    // Kiểm tra xem có mật khẩu mới hay không
    if (updateStudentDto.password) {
      // Băm mật khẩu mới nếu có
      updateStudentDto.password = await bcrypt.hash(
        updateStudentDto.password,
        10,
      );
    }

    // Cập nhật thông tin sinh viên theo ID và DTO
    const student = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .select('-password -refreshToken');

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
