import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Contract, StatusEnum } from './interfaces/contracts.interface';
import { CreateContractDto } from './dto/create-contract.dto';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';
import { Student } from '../students/interfaces/students.interface';
import {
  ContractType,
  TimeUnitEnum,
} from '../contract-types/interfaces/contract-types.interface';
import { Room } from '../rooms/interfaces/room.interface';
import { ContractTerm } from '../contract-terms/interfaces/contract-terms.interface';
import { Service } from '../services/interfaces/service.interface';

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel('Contract') private readonly contractModel: Model<Contract>,
    @InjectModel('Student') private readonly studentModel: Model<Student>,
    @InjectModel('Room') private readonly roomModel: Model<Room>,
    @InjectModel('Service') private readonly serviceModel: Model<Service>,
    @InjectModel('ContractType')
    private readonly contractTypeModel: Model<ContractType>,
    @InjectModel('ContractTerm')
    private readonly contractTermModel: Model<ContractTerm>,
  ) {}

  async createContract(
    createContractDto: CreateContractDto,
  ): Promise<Contract> {
    const { studentCode, contractType, room, service, term } =
      createContractDto;

    const existingRoom = await this.roomModel.findById(room.roomId);
    if (!existingRoom) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Phòng không tồn tại.',
        messageCode: 'ROOM_NOT_FOUND',
      });
    }

    // Kiểm tra từng dịch vụ trong mảng service
    for (const serviceItem of service) {
      const existingService = await this.serviceModel.findById(
        serviceItem.serviceId,
      );
      if (!existingService) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: `Dịch vụ với ID ${serviceItem.serviceId} không tồn tại.`,
          messageCode: 'SERVICE_NOT_FOUND',
        });
      }
    }

    // Kiểm tra từng điều khoản trong mảng term
    for (const termItem of term) {
      const existingTerm = await this.contractTermModel.findById(
        termItem.termId,
      );
      if (!existingTerm) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: `Điều khoản với ID ${termItem.termId} không tồn tại.`,
          messageCode: 'TERM_NOT_FOUND',
        });
      }
    }

    // Lấy thông tin sinh viên từ studentCode
    const student = await this.studentModel.findOne({ studentCode });
    if (!student) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Sinh viên không tồn tại.',
        messageCode: 'STUDENT_NOT_FOUND',
      });
    }

    // Kiểm tra sinh viên đã đăng ký phòng hay chưa
    if (student.roomId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Sinh viên đã đăng ký phòng. Vui lòng kiểm tra lại.',
        messageCode: 'STUDENT_ROOM_ALREADY_REGISTERED',
      });
    }

    const existingContractType = await this.contractTypeModel.findById(
      contractType.contractTypeId,
    );
    if (!existingContractType) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Loại hợp đồng không tồn tại.',
        messageCode: 'CONTRACT_TYPE_NOT_FOUND',
      });
    }

    // Tính toán ngày hết hạn hợp đồng từ ngày hiện tại và thời gian trong contractType
    const currentDate = new Date();
    let endDate: Date;

    if (contractType.unit === TimeUnitEnum.YEAR) {
      endDate = new Date(
        currentDate.setFullYear(
          currentDate.getFullYear() + contractType.duration,
        ),
      );
    } else if (contractType.unit === TimeUnitEnum.MONTH) {
      endDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + contractType.duration),
      );
    } else if (contractType.unit === TimeUnitEnum.DAY) {
      endDate = new Date(
        currentDate.setDate(currentDate.getDate() + contractType.duration),
      );
    }

    // Tính toán ngày tốt nghiệp từ năm nhập học của sinh viên
    const enrollmentYear = parseInt(student.enrollmentYear, 10); // Chuyển chuỗi năm nhập học thành số
    const graduationDate = new Date(enrollmentYear + 4, 11, 31); // Ngày tốt nghiệp được tính là 31 tháng 12 của năm tốt nghiệp

    if (endDate > graduationDate) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Hợp đồng không thể ký vì vượt quá số ngày cho phép.',
        messageCode: 'CONTRACT_EXCEEDS_GRADUATION',
      });
    }

    // Kiểm tra lấy hợp đồng mới nhất
    const existingContract = await this.contractModel
      .findOne({ studentCode })
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo hợp đồng

    if (existingContract) {
      const existingEndDate = new Date(existingContract.endDate);
      const currentDate = new Date();

      // Kiểm tra hợp đồng đã hết hạn hoặc đã bị hủy
      if (
        existingEndDate < currentDate ||
        existingContract.status === StatusEnum.CANCELLED
      ) {
        const newContract = await this.contractModel.create(createContractDto);
        return newContract;
      } else {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Sinh viên vẫn còn hợp đồng hiệu lực.',
          messageCode: 'CONTRACT_ACTIVE',
        });
      }
    }

    // Lưu hợp đồng mới
    const newContract = await this.contractModel.create(createContractDto);
    return newContract;
  }

  async findContracts(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
    filter?: StatusEnum, // Thêm tham số filter
  ): Promise<{ data: Contract[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery: { [key: string]: any } = buildSearchQuery({
      fields: ['studentCode'],
      searchTerm: search,
    });

    // Thêm điều kiện lọc trạng thái hợp đồng nếu filter có giá trị
    if (filter) {
      searchQuery.status = filter;
    }

    // Xây dựng các tùy chọn phân trang
    const { skip, limit: pageLimit } = paginateQuery(page, limit);

    // Xây dựng các tùy chọn sắp xếp
    const sortOptions = getSortOptions({ createdAt: sortDirection });

    // Tìm kiếm tài liệu
    const query = this.contractModel.find(searchQuery);

    // Đếm tổng số tài liệu phù hợp
    const total = await this.contractModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp
    const contracts = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: contracts, meta };
  }

  async findByIdContract(id: string): Promise<Contract> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const contract = await this.contractModel.findById(id);

    if (!contract) {
      throw new NotFoundException(`Không tìm thấy hợp đồng với ID: ${id}`);
    }

    return contract;
  }

  async updateContract(
    id: string,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    // Cập nhật thông tin hợp đồng theo ID và DTO
    const contract = await this.contractModel.findByIdAndUpdate(
      id,
      updateContractDto,
      {
        new: true,
      },
    );

    if (!contract) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy hợp đồng với ID ${id}`);
    }
    return contract;
  }

  async removeContract(id: string): Promise<ResponseInterface> {
    // Xóa hợp đồng theo ID
    const contract = await this.contractModel.findByIdAndDelete(id);
    if (!contract) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy hợp đồng với ID ${id}`);
    }

    // Kiểm tra trạng thái hợp đồng có cho phép xóa không
    if (contract.status !== StatusEnum.PENDING) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message:
          'Hợp đồng không thể xóa do trạng thái hiện tại không cho phép.',
        messageCode: 'CONTRACT_CANNOT_BE_DELETED',
      });
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Hợp đồng với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }

  async confirmContract(id: string): Promise<Contract> {
    const contract = await this.contractModel.findById(id);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    const student = await this.studentModel.findOne({
      studentCode: contract.studentCode,
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên trong hợp đồng.');
    }

    // Kiểm tra sinh viên đã đăng ký phòng hay chưa
    if (student.roomId) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Sinh viên đã đăng ký phòng. Vui lòng kiểm tra lại.',
        messageCode: 'STUDENT_ROOM_ALREADY_REGISTERED',
      });
    } else {
      // Gán id phòng từ hợp đồng cho sinh viên
      student.roomId = contract.room.roomId;
      await student.save();
    }

    // Tính toán ngày hết hạn hợp đồng từ ngày hiện tại và thời gian trong contractType
    const currentDate = new Date();
    let endDate: Date;

    if (contract.contractType.unit === TimeUnitEnum.YEAR) {
      endDate = new Date(
        currentDate.setFullYear(
          currentDate.getFullYear() + contract.contractType.duration,
        ),
      );
    } else if (contract.contractType.unit === TimeUnitEnum.MONTH) {
      endDate = new Date(
        currentDate.setMonth(
          currentDate.getMonth() + contract.contractType.duration,
        ),
      );
    } else if (contract.contractType.unit === TimeUnitEnum.DAY) {
      endDate = new Date(
        currentDate.setDate(
          currentDate.getDate() + contract.contractType.duration,
        ),
      );
    }

    // Tính toán ngày tốt nghiệp từ năm nhập học của sinh viên
    const enrollmentYear = parseInt(student.enrollmentYear, 10); // Chuyển chuỗi năm nhập học thành số
    const graduationDate = new Date(enrollmentYear + 4, 11, 31); // Ngày tốt nghiệp được tính là 31 tháng 12 của năm tốt nghiệp

    if (endDate > graduationDate) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Hợp đồng không thể duyệt vì vượt quá số ngày cho phép.',
        messageCode: 'CONTRACT_EXCEEDS_GRADUATION',
      });
    }

    if (
      contract.startDate ||
      contract.endDate ||
      contract.status !== StatusEnum.PENDING
    ) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Hợp đồng này đã được duyệt trước đó. Vui lòng kiểm tra lại.',
        messageCode: 'CONTRACT_ACTIVE',
      });
    }

    // Tính toán ngày bắt đầu và ngày kết thúc
    contract.startDate = currentDate.toISOString(); // Ngày bắt đầu là ngày duyệt hợp đồng
    contract.endDate = endDate.toISOString();

    // Cập nhật trạng thái và thời gian xác nhận cho từng dịch vụ
    const updatedServices = contract.service.map((serviceItem) => ({
      ...serviceItem,
      status: StatusEnum.CONFIRMED,
      confirmedAt: currentDate.toISOString(),
    }));
    contract.service = updatedServices;

    // Xác nhận hợp đồng
    contract.status = StatusEnum.CONFIRMED;
    return await contract.save();
  }

  async requestCancelContract(id: string): Promise<Contract> {
    const contract = await this.contractModel.findById(id);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    // Kiểm tra trạng thái hợp đồng có cho phép hủy không
    if (contract.status !== StatusEnum.CONFIRMED) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message:
          'Hợp đồng không thể hủy do trạng thái hiện tại không cho phép.',
        messageCode: 'CONTRACT_CANNOT_BE_CANCELLED',
      });
    }

    // Cập nhật trạng thái hợp đồng thành PENDING_CANCELLATION
    contract.status = StatusEnum.PENDING_CANCELLATION;
    await contract.save();

    return contract;
  }

  async cancelContract(id: string): Promise<Contract> {
    const contract = await this.contractModel.findById(id);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    // Cập nhật trạng thái hợp đồng thành CANCELLED
    contract.status = StatusEnum.CANCELLED;
    await contract.save();

    return contract;
  }
}
