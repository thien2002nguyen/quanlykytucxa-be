import { ResponseInterface } from '../../interfaces/response.interface';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { Admin, AdminAccount } from './interfaces/admin.interface';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  generateAccessAdminToken,
  generateRefreshAdminToken,
  verifyAdminToken,
} from 'src/utils/tokenUtils';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { parseExpiration } from 'src/utils/expirationUtils';
import { TypeLogin } from 'src/interfaces/login.interfaces';
import { MetaPagination } from 'src/common/constant';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const { fullName, phoneNumber, email, password } = createAdminDto;

    // Kiểm tra tính duy nhất của email
    const existingStudentByEmail = await this.adminModel.findOne({ email });
    if (existingStudentByEmail) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Email đã tồn tại.',
        messageCode: 'EMAIL_EXISTED',
      });
    }

    // Kiểm tra tính duy nhất của số điện thoại
    const existingStudentByPhone = await this.adminModel.findOne({
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

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = this.adminModel.create({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    // Chuyển đổi đối tượng và loại bỏ trường `password`
    const adminData = (await newAdmin).toObject();
    delete adminData.password; // Xóa trường password

    return adminData; // Trả về admin mà không có trường password
  }

  async login({ userName, password }: TypeLogin): Promise<{
    data: Admin;
    token: {
      expiresIn: number; // Thời gian còn lại của accessToken
      accessToken: string;
      refreshToken: string;
      refreshExpiresIn: number; // Thời gian còn lại của refreshToken
    };
  }> {
    const admin = await this.adminModel.findOne({
      $or: [{ email: userName }, { phoneNumber: userName }],
    });

    if (!admin) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Thông tin đăng nhập không chính xác.',
        messageCode: 'INVALID_CREDENTIALS',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Thông tin đăng nhập không chính xác.',
        messageCode: 'INVALID_CREDENTIALS',
      });
    }

    // Tạo access token và refresh token
    const accessToken = generateAccessAdminToken(
      admin._id.toString(),
      admin.role,
    );
    const refreshToken = generateRefreshAdminToken(
      admin._id.toString(),
      admin.role,
    );

    // Lưu refresh token vào cơ sở dữ liệu
    admin.refreshToken = refreshToken;
    await admin.save();

    // Chuyển đổi đối tượng và loại bỏ trường `password`
    const adminData = admin.toObject();
    delete adminData.password; // Xóa trường password
    delete adminData.refreshToken; // Xóa trường refreshToken

    const ACCESS_TOKEN_EXPIRATION = parseExpiration(
      process.env.ACCESS_TOKEN_EXPIRATION || '1d',
    );
    const REFRESH_TOKEN_EXPIRATION = parseExpiration(
      process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    );

    // Trả về thông tin admin cùng với token và expiresIn
    return {
      data: adminData,
      token: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRATION, // Thời gian tồn tại của access token
        refreshExpiresIn: REFRESH_TOKEN_EXPIRATION, // Thời gian tồn tại của refresh token
      },
    };
  }

  async refreshAccessToken(refreshTokenAdminDto: string): Promise<{
    accessToken: string;
  }> {
    // Kiểm tra tính hợp lệ của refreshTokenAdminDto
    const decoded = verifyAdminToken(refreshTokenAdminDto);

    // Tìm admin dựa trên decoded thông tin (id) từ refreshTokenAdminDto
    const admin = await this.adminModel.findById(decoded.id);
    if (!admin) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Không tìm thấy quản trị viên.',
        messageCode: 'ADMIN_NOT_FOUND',
      });
    }

    // Kiểm tra xem refreshToken trong database có khớp không
    if (admin.refreshToken !== refreshTokenAdminDto) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Refresh token không hợp lệ.',
        messageCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Tạo mới access token
    const accessToken = generateAccessAdminToken(
      admin._id.toString(),
      admin.role,
    );

    return { accessToken };
  }

  async findAdmins(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Admin[]; meta: MetaPagination }> {
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
    const query = this.adminModel.find(searchQuery);

    // Đếm tổng số tài liệu phù hợp
    const total = await this.adminModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp

    const admins = await query.skip(skip).limit(pageLimit).sort(sortOptions);
    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: admins, meta };
  }

  async findAllAdmins(): Promise<Admin[]> {
    // Lấy tất cả quản trị viên từ cơ sở dữ liệu
    return this.adminModel.find().select('-password -refreshToken');
  }

  async findByIdAdmin(id: string): Promise<Admin> {
    // Kiểm tra xem id có phải là một ObjectId hợp lệ không
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    // Tìm quản trị viên theo ID
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(
        `Không tìm thấy quản trị viên nào với ID: ${id}`,
      );
    }
    return admin;
  }

  async insertAdminsExample(
    adminAccounts: AdminAccount[],
  ): Promise<ResponseInterface> {
    // Tạo mảng các Promise từ các cuộc gọi đến createAdmin
    const adminPromises = adminAccounts.map(async (admin) => {
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      return this.adminModel.create({
        fullName: admin.fullName,
        phoneNumber: admin.phoneNumber,
        email: admin.email,
        password: hashedPassword,
        role: admin.role,
      });
    });

    // Chờ tất cả Promise hoàn thành
    await Promise.all(adminPromises);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tất cả tài khoản admin mẫu đã được thêm thành công.',
      messageCode: 'INSERT_SUCCESS',
    };
  }

  async updateAdmin(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    // Kiểm tra xem có trường password trong DTO hay không
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    // Cập nhật thông tin quản trị viên theo ID và DTO
    const admin = await this.adminModel
      .findByIdAndUpdate(id, updateAdminDto, {
        new: true,
      })
      .select('-password -refreshToken');

    if (!admin) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy quản trị viên với ID ${id}`);
    }
    return admin;
  }

  async removeAdmin(id: string): Promise<ResponseInterface> {
    // Xóa quản trị viên theo ID
    const result = await this.adminModel.findByIdAndDelete(id);
    if (!result) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy quản trị viên với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Quản trị viên với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
