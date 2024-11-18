import { ResponseInterface } from '../../interfaces/response.interface';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { generateAccessToken, verifyToken } from 'src/utils/token.utils';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { getRefreshTokenExpirationDate } from 'src/utils/expiration.utils';
import { MetaPagination } from 'src/common/constant';
import {
  InsertUserInterface,
  LoginInterface,
  RegisterResponseInterface,
  User,
} from './interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as crypto from 'crypto';
import { EmailService } from './email.service';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ChangePasswordDto } from './dto/changePasswordDto.dto';
import { Student } from '../students/interfaces/students.interface';
import { mailOtp } from './sendOtpEmail';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Student') private readonly studentModel: Model<Student>,
    private readonly emailService: EmailService,
  ) {}

  // Phương thức đăng ký người dùng
  async register(registerDto: RegisterDto): Promise<RegisterResponseInterface> {
    const { userName, phoneNumber, email, studentCode } = registerDto;

    // Kiểm tra tính duy nhất của userName, email, phoneNumber
    const existingByUserName = await this.userModel.findOne({ userName });
    if (existingByUserName) {
      throw new BadRequestException('Tên đăng nhập đã tồn tại.');
    }

    const existingByEmail = await this.userModel.findOne({ email });
    if (existingByEmail) {
      throw new BadRequestException('Email đã tồn tại.');
    }

    const existingByPhone = await this.userModel.findOne({ phoneNumber });
    if (existingByPhone) {
      throw new BadRequestException('Số điện thoại đã tồn tại.');
    }

    // Kiểm tra sinh viên có trong danh sách sinh viên hay không
    const existingByStudentCode = await this.studentModel.findOne({
      studentCode,
    });
    if (!existingByStudentCode) {
      throw new BadRequestException(
        'Mã sinh viên không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã sinh viên hoặc liên hệ bộ phận hỗ trợ sinh viên để được giúp đỡ.',
      );
    }

    // Tạo OTP ngẫu nhiên
    const otp = crypto.randomInt(100000, 999999).toString();

    // Lưu OTP vào cơ sở dữ liệu, ví dụ trong collection `user`
    const otpExpiration = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút

    await this.userModel.create({
      ...registerDto,
      otp,
      otpExpiration,
    });

    // Gửi OTP qua email
    await this.emailService.sendOtpEmail({
      to: email,
      title: 'Xác thực Email - Mã OTP - Quản lý ký túc xá',
      content: mailOtp(otp),
    });

    // Trả về thông báo yêu cầu người dùng nhập OTP
    return {
      message:
        'OTP đã được gửi tới email của bạn. Vui lòng kiểm tra và nhập mã OTP để hoàn tất đăng ký.',
      data: {
        email,
        studentCode,
      },
    };
  }

  // Phương thức xác thực OTP
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
    otpVerified: boolean;
    data: User;
  }> {
    const user = await this.userModel.findOne({ email: verifyOtpDto.email });

    const student = await this.studentModel.findOne({
      studentCode: verifyOtpDto.studentCode,
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    if (!student) {
      throw new BadRequestException(
        'Mã sinh viên không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã sinh viên hoặc liên hệ bộ phận hỗ trợ sinh viên để được giúp đỡ.',
      );
    }

    // Kiểm tra OTP và thời gian hết hạn
    if (user.otp !== verifyOtpDto.otp) {
      throw new BadRequestException('Mã OTP không đúng');
    }

    if (user.otpExpiration < Date.now()) {
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    // Kiểm tra sinh viên đã có tài khoản hay chưa
    if (student.userId) {
      throw new BadRequestException(
        'Sinh viên đã có tài khoản. Vui lòng đăng nhập.',
      );
    }

    // Cập nhật id tài khoản vào student
    const updateStudent = await this.studentModel.findOneAndUpdate(
      { studentCode: verifyOtpDto.studentCode },
      { userId: user._id },
      { new: true },
    );

    if (!updateStudent) {
      throw new BadRequestException('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }

    // Xóa OTP sau khi xác thực thành công
    const updateUser = await this.userModel
      .findOneAndUpdate(
        { email: verifyOtpDto.email },
        { otp: null, otpExpiration: null },
        { new: true },
      )
      .select('-refreshToken -password -otp -otpExpiration');

    return { otpVerified: true, data: updateUser };
  }

  // Phương thức đổi mật khẩu người dùng
  async changePassword(changePasswordDto: ChangePasswordDto): Promise<User> {
    const user = await this.userModel.findOne({
      email: changePasswordDto.email,
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.password, 10);

    // Lưu thông tin người dùng vào cơ sở dữ liệu
    const updateUser = await this.userModel
      .findOneAndUpdate(
        { email: changePasswordDto.email },
        { password: hashedPassword },
      )
      .select('-refreshToken -password -otp -otpExpiration');

    return updateUser;
  }

  async login({ userName, password }: LoginInterface): Promise<{
    data: User;
    token: {
      accessToken: string;
      refreshToken: string;
      refreshExpiresIn: number;
    };
  }> {
    const user = await this.userModel.findOne({
      $or: [{ userName }, { email: userName }, { phoneNumber: userName }],
    });

    if (!user) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Thông tin đăng nhập không chính xác.',
        messageCode: 'INVALID_CREDENTIALS',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Thông tin đăng nhập không chính xác.',
        messageCode: 'INVALID_CREDENTIALS',
      });
    }

    // Tạo access token và refresh token
    const token = generateAccessToken(user._id.toString(), user.role);

    // Lưu refresh token vào cơ sở dữ liệu
    user.refreshToken = token.refreshToken;
    await user.save();

    // Chuyển đổi đối tượng và loại bỏ trường `password`
    const userData = user.toObject();
    delete userData.password; // Xóa trường password
    delete userData.refreshToken; // Xóa trường refreshToken

    const REFRESH_TOKEN_EXPIRATION = getRefreshTokenExpirationDate(
      process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    );

    // Trả về thông tin user cùng với token và expiresIn
    return {
      data: userData,
      token: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        refreshExpiresIn: REFRESH_TOKEN_EXPIRATION, // Thời gian tồn tại của refresh token
      },
    };
  }

  async refreshAccessToken(refreshTokenDto: string): Promise<{
    accessToken: string;
  }> {
    // Kiểm tra tính hợp lệ của refreshTokenDto
    const decoded = verifyToken(refreshTokenDto);

    // Tìm user dựa trên decoded thông tin (id) từ refreshTokenDto
    const user = await this.userModel.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Không tìm thấy tài khoản.',
        messageCode: 'USER_NOT_FOUND',
      });
    }

    // Kiểm tra xem refreshToken trong database có khớp không
    if (user.refreshToken !== refreshTokenDto) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Refresh token không hợp lệ.',
        messageCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Tạo mới access token
    const { accessToken } = generateAccessToken(user._id.toString(), user.role);

    return { accessToken };
  }

  async findUsers(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: User[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery = buildSearchQuery({
      fields: ['userName'],
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
    const query = this.userModel.find(searchQuery);

    // Đếm tổng số tài liệu phù hợp
    const total = await this.userModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp

    const users = await query
      .skip(skip)
      .limit(pageLimit)
      .sort(sortOptions)
      .select('-password -refreshToken');
    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: users, meta };
  }

  async findByIdUser(id: string): Promise<User> {
    // Kiểm tra xem id có phải là một ObjectId hợp lệ không
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    // Tìm user theo ID
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken');
    if (!user) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy tài khoản nào với ID: ${id}`);
    }
    return user;
  }

  async insertUsersExample(
    insertUserInterface: InsertUserInterface[],
  ): Promise<ResponseInterface> {
    // Tạo mảng các Promise từ các cuộc gọi đến create
    const userPromises = insertUserInterface.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      return this.userModel.create({
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      });
    });

    // Chờ tất cả Promise hoàn thành
    await Promise.all(userPromises);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tất cả tài khoản admin mẫu đã được thêm thành công.',
      messageCode: 'INSERT_SUCCESS',
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Kiểm tra và mã hóa password nếu có
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      // Cập nhật thông tin user và chọn trường cần thiết
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
        })
        .select('-password -refreshToken');

      if (!user) {
        throw new NotFoundException(`Không tìm thấy tài khoản với ID ${id}`);
      }

      return user;
    } catch (error: any) {
      if (error.code === 11000) {
        // Kiểm tra lỗi trùng lặp theo mã lỗi của MongoDB
        if (error.keyPattern?.userName) {
          throw new ConflictException('Tên đăng nhập đã tồn tại');
        }
        if (error.keyPattern?.email) {
          throw new ConflictException('Email đã tồn tại');
        }
        if (error.keyPattern?.phoneNumber) {
          throw new ConflictException('Số điện thoại đã tồn tại');
        }
      }
      throw error; // Ném lại lỗi nếu không phải lỗi trùng lặp
    }
  }

  async removeUser(id: string): Promise<ResponseInterface> {
    // Xóa xóa tài khoản theo ID
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy xóa tài khoản với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Xóa tài khoản với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
