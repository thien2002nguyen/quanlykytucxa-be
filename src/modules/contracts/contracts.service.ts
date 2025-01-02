import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Contract, StatusEnum } from './interfaces/contracts.interface';
import { CreateContractDto } from './dto/create-contract.dto';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';
import { Student } from '../students/interfaces/students.interface';
import {
  ContractType,
  TimeUnitEnum,
} from '../contract-types/interfaces/contract-types.interface';
import { Room } from '../rooms/interfaces/room.interface';
import { Service } from '../services/interfaces/service.interface';
import * as dayjs from 'dayjs';
import { CreateServiceContractDto } from './dto/create-service-contract.dto';
import { Payment } from '../payments/interfaces/payments.interface';

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel('Contract') private readonly contractModel: Model<Contract>,
    @InjectModel('Student') private readonly studentModel: Model<Student>,
    @InjectModel('Room') private readonly roomModel: Model<Room>,
    @InjectModel('Service') private readonly serviceModel: Model<Service>,
    @InjectModel('ContractType')
    private readonly contractTypeModel: Model<ContractType>,
    @InjectModel('Payment') private readonly paymentModel: Model<Payment>,
  ) {}

  async createContract(
    createContractDto: CreateContractDto,
  ): Promise<Contract> {
    const { studentCode, contractTypeId, roomId, services } = createContractDto;

    const existingRoom = await this.roomModel.findById(roomId);
    if (!existingRoom) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Phòng không tồn tại.',
        messageCode: 'ROOM_NOT_FOUND',
      });
    }

    if (existingRoom.registeredStudents >= existingRoom.maximumCapacity) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Số lượng sinh viên đã đạt đến giới hạn sức chứa phòng.',
        messageCode: 'ROOM_MAXIMUM_CAPACITY_REACHED',
      });
    }

    // Kiểm tra từng dịch vụ trong mảng serviceIds
    for (const item of services) {
      const existingService = await this.serviceModel.findById(item.serviceId);
      if (!existingService) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: `Dịch vụ với ID ${item} không tồn tại.`,
          messageCode: 'SERVICE_NOT_FOUND',
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

    const existingContractType =
      await this.contractTypeModel.findById(contractTypeId);
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

    if (existingContractType.unit === TimeUnitEnum.YEAR) {
      endDate = new Date(
        currentDate.setFullYear(
          currentDate.getFullYear() + existingContractType.duration,
        ),
      );
    } else if (existingContractType.unit === TimeUnitEnum.MONTH) {
      endDate = new Date(
        currentDate.setMonth(
          currentDate.getMonth() + existingContractType.duration,
        ),
      );
    } else if (existingContractType.unit === TimeUnitEnum.DAY) {
      endDate = new Date(
        currentDate.setDate(
          currentDate.getDate() + existingContractType.duration,
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
        message: 'Hợp đồng không thể ký vì vượt quá số ngày cho phép.',
        messageCode: 'CONTRACT_EXCEEDS_GRADUATION',
      });
    }

    // Kiểm tra lấy hợp đồng mới nhất
    const existingContract = await this.contractModel
      .findOne({ studentCode })
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo hợp đồng

    if (existingContract) {
      // Kiểm tra trạng thái hợp đồng là PENDING
      if (existingContract.status === StatusEnum.PENDING) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Yêu cầu đăng ký hợp đồng đang chờ xét duyệt.',
          messageCode: 'CONTRACT_PENDING',
        });
      }

      const existingEndDate = new Date(existingContract.endDate);
      const currentDate = new Date();

      // Kiểm tra hợp đồng đã hết hạn hoặc đã bị hủy
      if (
        existingEndDate < currentDate ||
        existingContract.status === StatusEnum.CANCELLED
      ) {
        const newContract = await this.contractModel.create(createContractDto);

        if (newContract) {
          student.contractId = new Types.ObjectId(newContract._id as string);
          await student.save();
        } else {
          throw new BadRequestException('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }

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

    if (newContract) {
      student.contractId = new Types.ObjectId(newContract._id as string);
      await student.save();
    } else {
      throw new BadRequestException('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }

    return newContract;
  }

  async findContracts(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
    filter: StatusEnum, // Thêm tham số filter
  ): Promise<{ data: Contract[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery: { [key: string]: any } = buildSearchQuery({
      fields: ['studentCode', 'fullName'],
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
    const query = this.contractModel
      .find(searchQuery)
      .populate({
        path: 'roomId',
        populate: [{ path: 'roomBlockId' }, { path: 'roomTypeId' }],
      })
      .populate('contractTypeId')
      .populate('adminId', 'userName email phoneNumber')
      .populate('services.serviceId');

    // Đếm tổng số tài liệu phù hợp
    const total = await this.contractModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp
    const contracts = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    const now = dayjs();
    const expiredIds = contracts
      .filter(
        (item) =>
          item.endDate &&
          dayjs(item.endDate).isBefore(now) &&
          (item.status === StatusEnum.CONFIRMED ||
            item.status === StatusEnum.PENDING_CANCELLATION),
      )
      .map((item) => item._id);

    await this.contractModel.updateMany(
      { _id: { $in: expiredIds } },
      { $set: { status: StatusEnum.EXPIRED } },
    );

    const newContracts = contracts.map((item) => {
      if (expiredIds.includes(item._id)) {
        item.status = StatusEnum.EXPIRED;
      }
      return item;
    });

    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: newContracts, meta };
  }

  async findByIdContract(id: string): Promise<Contract> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const contract = await this.contractModel
      .findById(id)
      .populate({
        path: 'roomId',
        populate: [{ path: 'roomBlockId' }, { path: 'roomTypeId' }],
      })
      .populate('contractTypeId')
      .populate('adminId', 'userName email phoneNumber')
      .populate('services.serviceId');

    if (!contract) {
      throw new NotFoundException(`Không tìm thấy hợp đồng với ID: ${id}`);
    }

    const now = dayjs();
    const endDate = dayjs(contract.endDate);

    // Kiểm tra nếu hợp đồng quá hạn và cập nhật trạng thái nếu cần
    if (
      endDate.isBefore(now) &&
      (contract.status === StatusEnum.CONFIRMED ||
        contract.status === StatusEnum.PENDING_CANCELLATION)
    ) {
      contract.status = StatusEnum.EXPIRED; // Cập nhật trạng thái thành 'quá hạn'
      await contract.save(); // Lưu thông tin đã thay đổi vào database
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

    const student = await this.studentModel.findOne({
      studentCode: contract.studentCode,
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên trong hợp đồng.');
    }

    // Gán id phòng từ hợp đồng cho sinh viên
    student.roomId = undefined;
    student.contractId = undefined;
    await student.save();

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Hợp đồng với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }

  async confirmContract(id: string, adminId: string): Promise<Contract> {
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

    const room = await this.roomModel.findById(contract.roomId);
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng.');
    }

    if (room.registeredStudents >= room.maximumCapacity) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Số lượng sinh viên đã đạt đến giới hạn sức chứa phòng.',
        messageCode: 'ROOM_MAXIMUM_CAPACITY_REACHED',
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

    // Lấy ngày hiện tại
    const currentDate = new Date();

    // Tính toán ngày bắt đầu là ngày 1 của tháng tiếp theo
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );

    // Tính toán ngày hết hạn hợp đồng từ ngày bắt đầu và thời gian trong contractType
    let endDate: Date;

    const contractType = await this.contractTypeModel.findById(
      contract.contractTypeId,
    );

    if (contractType.unit === TimeUnitEnum.YEAR) {
      endDate = new Date(
        new Date(startDate).setFullYear(
          startDate.getFullYear() + contractType.duration,
        ),
      );
    } else if (contractType.unit === TimeUnitEnum.MONTH) {
      endDate = new Date(
        new Date(startDate).setMonth(
          startDate.getMonth() + contractType.duration,
        ),
      );
    } else if (contractType.unit === TimeUnitEnum.DAY) {
      endDate = new Date(
        new Date(startDate).setDate(
          startDate.getDate() + contractType.duration,
        ),
      );
    }

    // Tính toán ngày tốt nghiệp từ năm nhập học của sinh viên
    const enrollmentYear = parseInt(student.enrollmentYear, 10); // Chuyển chuỗi năm nhập học thành số
    const graduationDate = new Date(enrollmentYear + 4, 11, 31); // Ngày tốt nghiệp là 31/12 của 4 năm kể từ ngày nhập học

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

    // Cập nhật thông tin phòng và sinh viên
    student.roomId = contract.roomId;
    await student.save();

    room.registeredStudents += 1;
    await room.save();

    // Cập nhật ngày bắt đầu, ngày kết thúc và ngày duyệt hợp đồng
    contract.startDate = startDate.toISOString();
    contract.endDate = endDate.toISOString();
    contract.approvedDate = currentDate.toISOString();
    contract.adminId = new Types.ObjectId(adminId);

    // Cập nhật trạng thái và thời gian xác nhận cho từng dịch vụ
    contract.services = contract.services.map((serviceItem) => ({
      ...serviceItem,
      createdAt: currentDate.toISOString(),
    }));

    // Xác nhận hợp đồng
    contract.status = StatusEnum.CONFIRMED;

    // Lưu hợp đồng
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

  async removeRequestCancelContract(id: string): Promise<Contract> {
    const contract = await this.contractModel.findById(id);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    // Kiểm tra trạng thái hợp đồng có cho phép hủy không
    if (contract.status !== StatusEnum.PENDING_CANCELLATION) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message:
          'Hợp đồng không thể hủy do trạng thái hiện tại không cho phép.',
        messageCode: 'CONTRACT_CANNOT_BE_PENDING_CANCELLATION',
      });
    }

    // Cập nhật trạng thái hợp đồng thành CONFIRMED
    contract.status = StatusEnum.CONFIRMED;
    await contract.save();

    return contract;
  }

  async cancelContract(id: string): Promise<Contract> {
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

    const room = await this.roomModel.findById(contract.roomId);
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng.');
    }

    const newRegisterStudents = room.registeredStudents - 1;

    if (
      contract.status === StatusEnum.CONFIRMED ||
      contract.status === StatusEnum.PENDING_CANCELLATION
    ) {
      if (newRegisterStudents < 0) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message:
            'Đã có lỗi xảy ra. Không thể giảm số lượng sinh viên trong phòng xuống dưới 0.',
          messageCode: 'ROOM_STUDENT_COUNT_INVALID',
        });
      } else {
        // Cập nhật số sinh viên có trong phòng
        room.registeredStudents = newRegisterStudents;
        await room.save();
      }
    }

    // Gán id phòng từ hợp đồng cho sinh viên
    student.roomId = undefined;
    student.contractId = undefined;
    await student.save();

    // Cập nhật trạng thái hợp đồng thành CANCELLED
    contract.status = StatusEnum.CANCELLED;
    await contract.save();

    return contract;
  }

  async updateCheckInDate(id: string): Promise<Contract> {
    const contract = await this.contractModel.findById(id);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    if (
      contract.status !== StatusEnum.CONFIRMED &&
      contract.status !== StatusEnum.PENDING_CANCELLATION
    ) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Trạng thái hợp đồng không cho phép cập nhật ngày nhận phòng.',
        messageCode: 'CONTRACT_STATUS_INVALID',
      });
    }

    contract.checkInDate = new Date().toISOString();
    await contract.save();
    return contract;
  }

  async updateCheckOutDate(id: string): Promise<Contract> {
    const contract = await this.contractModel.findById(id);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    if (!contract.checkInDate) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Chưa nhận phòng.',
        messageCode: 'INVALID_CHECK_OUT_DATE',
      });
    }

    const student = await this.studentModel.findOne({
      studentCode: contract.studentCode,
    });
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên trong hợp đồng.');
    }

    const room = await this.roomModel.findById(contract.roomId);
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng.');
    }

    const newRegisterStudents = room.registeredStudents - 1;

    if (
      contract.status === StatusEnum.CONFIRMED ||
      contract.status === StatusEnum.PENDING_CANCELLATION
    ) {
      if (newRegisterStudents < 0) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message:
            'Đã có lỗi xảy ra. Không thể giảm số lượng sinh viên trong phòng xuống dưới 0.',
          messageCode: 'ROOM_STUDENT_COUNT_INVALID',
        });
      } else {
        // Cập nhật số sinh viên có trong phòng
        room.registeredStudents = newRegisterStudents;
        await room.save();
      }
    }

    // Gán id phòng từ hợp đồng cho sinh viên
    student.roomId = undefined;
    student.contractId = undefined;
    await student.save();

    // Cập nhật trạng thái hợp đồng thành CANCELLED
    contract.status = StatusEnum.CANCELLED;
    contract.checkOutDate = new Date().toISOString();
    await contract.save();
    return contract;
  }

  async addService(
    contractId: string,
    createServiceDto: CreateServiceContractDto,
  ) {
    const contract = await this.contractModel.findById(contractId);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    const { serviceId } = createServiceDto;

    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ.');
    }

    const startOfMonth = dayjs().startOf('month').toISOString(); // Đầu tháng
    const endOfMonth = dayjs().endOf('month').toISOString(); // Cuối tháng

    // Tìm hóa đơn trong tháng hiện tại
    const existingPayment = await this.paymentModel.findOne({
      contractId: new Types.ObjectId(contractId),
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    // Nếu đã có hóa đơn trong tháng
    if (existingPayment) {
      // Kiểm tra nếu dịch vụ đã tồn tại trong hóa đơn
      const isServiceInPayment = existingPayment.services.some(
        (service) => String(service.serviceId) === String(serviceId),
      );

      if (!isServiceInPayment) {
        // Thêm dịch vụ vào hóa đơn
        existingPayment.services.push({
          serviceId: new Types.ObjectId(service._id as string),
          name: service.name,
          price: service.price,
          createdAt: new Date().toISOString(),
        });
        await existingPayment.save();
      }
    }

    // Kiểm tra nếu dịch vụ đã tồn tại trong danh sách hợp đồng
    const isServiceInContract = contract.services.some(
      (service) => String(service.serviceId) === String(serviceId),
    );

    if (!isServiceInContract) {
      // Thêm dịch vụ vào hợp đồng
      contract.services.push({
        serviceId: new Types.ObjectId(service._id as string),
        createdAt: new Date().toISOString(),
      });
      await contract.save();
    }

    return contract;
  }

  async removeService(contractId: string, serviceId: string) {
    const contract = await this.contractModel.findById(contractId);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng.');
    }

    const serviceIndex = contract.services.findIndex(
      (service) => String(service.serviceId) === serviceId,
    );

    if (serviceIndex === -1) {
      throw new NotFoundException('Không tìm thấy dịch vụ trong hợp đồng.');
    }

    // Xóa dịch vụ khỏi danh sách
    contract.services.splice(serviceIndex, 1);
    await contract.save();

    return contract;
  }
}
