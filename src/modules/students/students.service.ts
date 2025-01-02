import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { MongoError } from 'mongodb';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './interfaces/students.interface';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';
import { parseCSV, parseExcel } from 'src/helpers/file-parser.utils';
import {
  Contract,
  StatusEnum,
} from '../contracts/interfaces/contracts.interface';
import * as dayjs from 'dayjs';
import { Service } from '../services/interfaces/service.interface';
import { Room } from '../rooms/interfaces/room.interface';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel('Student') private readonly studentModel: Model<Student>,
    @InjectModel('Contract') private readonly contractModel: Model<Contract>,
    @InjectModel('Service') private readonly serviceModel: Model<Service>,
    @InjectModel('Room') private readonly roomModel: Model<Room>,
  ) {}

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const { nationalIdCard } = createStudentDto;

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

    // Tạo sinh viên mới
    const newStudent = await this.studentModel.create(createStudentDto);

    return newStudent;
  }

  async findStudents(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Student[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery = buildSearchQuery({
      fields: ['fullName', 'studentCode'],
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
    const query = this.studentModel
      .find(searchQuery)
      .populate('userId', 'userName email phoneNumber');

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

  async findAuthMe(id: string): Promise<Student> {
    const userObjectId = new Types.ObjectId(id); // Chuyển đổi từ string sang ObjectId
    const student = await this.studentModel
      .findOne({ userId: userObjectId })
      .populate('userId', 'userName email phoneNumber')
      .populate({
        path: 'roomId',
        populate: ['roomTypeId', 'roomBlockId'],
      })
      .populate({
        path: 'contractId',
        populate: [
          'services.serviceId',
          {
            path: 'roomId',
            populate: ['roomTypeId', 'roomBlockId'],
          },
          'contractTypeId',
          {
            path: 'adminId',
            select: 'userName email phoneNumber',
          },
        ],
      });

    if (student.contractId) {
      const contract = await this.contractModel.findById(student.contractId);
      const room = await this.roomModel.findById(student.roomId);

      if (!contract) {
        student.contractId = undefined;
        student.roomId = undefined;
        await student.save();
        return;
      }

      const now = dayjs(); // Ngày hiện tại
      const endDate = dayjs(contract.endDate); // Chuyển đổi `contract.endDate` thành dayjs

      // Kiểm tra nếu hợp đồng quá hạn và cập nhật trạng thái nếu cần
      if (
        endDate.isBefore(now) &&
        (contract.status === StatusEnum.CONFIRMED ||
          contract.status === StatusEnum.PENDING_CANCELLATION)
      ) {
        student.contractId = undefined; // Cập nhật lại thông tin sinh viên
        student.roomId = undefined;
        await student.save();

        room.registeredStudents -= 1;
        room.save();

        contract.status = StatusEnum.EXPIRED; // Cập nhật trạng thái thành 'quá hạn'
        await contract.save(); // Lưu thông tin đã thay đổi vào database
      }

      // Xác định kiểu cho mảng invalidServices
      const invalidServices: Types.ObjectId[] = []; // Đây là mảng lưu các serviceId không tồn tại

      for (const service of contract.services) {
        const serviceExists = await this.serviceModel.exists({
          _id: service.serviceId,
        });

        if (!serviceExists) {
          invalidServices.push(service.serviceId); // Sử dụng service.serviceId thay vì _id
        }
      }

      if (invalidServices.length > 0) {
        // Lọc bỏ các dịch vụ không tồn tại khỏi mảng services
        contract.services = contract.services.filter(
          (service) => !invalidServices.includes(service.serviceId), // Sử dụng service.serviceId thay vì _id
        );

        await contract.save(); // Lưu thay đổi vào cơ sở dữ liệu
      }
    }

    return student;
  }

  async totalStudent(): Promise<number> {
    return this.studentModel.find().countDocuments();
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

  async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    try {
      // Cập nhật thông tin sinh viên theo ID và DTO
      const student = await this.studentModel.findByIdAndUpdate(
        id,
        updateStudentDto,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!student) {
        // Nếu không tìm thấy, ném ra lỗi không tìm thấy
        throw new NotFoundException(`Không tìm thấy sinh viên với ID: ${id}`);
      }

      return student;
    } catch (error: any) {
      // Kiểm tra xem lỗi có phải là lỗi trùng lặp MongoDB (E11000) không
      if (error.code === 11000) {
        // Xác định trường bị trùng lặp từ error.keyPattern
        const duplicateField = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${duplicateField} đã tồn tại`);
      }

      // Nếu là lỗi khác, ném ra lỗi ban đầu
      throw error;
    }
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

  async importStudents(
    fileBuffer: Buffer,
    fileExtension: string,
  ): Promise<ResponseInterface> {
    const studentsData =
      fileExtension === 'csv'
        ? await parseCSV(fileBuffer)
        : await parseExcel(fileBuffer);

    try {
      // Lưu thông tin sinh viên vào cơ sở dữ liệu
      const result = await this.studentModel.insertMany(studentsData);
      if (!result || result.length === 0) {
        // Nếu không có kết quả hoặc không có dữ liệu được chèn, ném lỗi
        throw new BadRequestException(
          `Không thể thêm sinh viên, dữ liệu không hợp lệ`,
        );
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Danh sách sinh viên đã được nhập thành công.',
        messageCode: 'IMPORT_SUCCESS',
      };
    } catch (error) {
      // Type casting the error to MongoError
      const mongoError = error as MongoError;

      console.log('mongoError: ', mongoError);

      if (mongoError.code === 11000) {
        throw new BadRequestException(
          'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại.',
        );
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  }
}
