import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import {
  CreateMonthlyPaymentInterface,
  PaymentStatusEnum,
  PaymentType,
} from './interfaces/payments.interface';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { Cron } from '@nestjs/schedule';
import {
  Contract,
  StatusEnum,
} from '../contracts/interfaces/contracts.interface';
import { Room } from '../rooms/interfaces/room.interface';
import { ContractType } from '../contract-types/interfaces/contract-types.interface';
import { RoomType } from '../room-type/interfaces/room-type.interface';
import { RoomBlock } from '../room-block/interfaces/room-block.interface';
import * as dayjs from 'dayjs'; // Import dayjs
import { MetaPagination } from 'src/common/constant';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Payment') private readonly paymentModel: Model<PaymentType>,
    @InjectModel('Contract') private contractModel: Model<Contract>,
    @InjectModel('ContractType') private contractTypeModel: Model<ContractType>,
    @InjectModel('Room') private roomModel: Model<Room>,
    @InjectModel('RoomType') private roomTypeModel: Model<RoomType>,
    @InjectModel('RoomBlock') private roomBlockModel: Model<RoomBlock>,
  ) {}

  @Cron('0 12 5 * *') // Chạy vào 12h trưa ngày 5 mỗi tháng
  async createMonthlyPayments(): Promise<void> {
    const currentDate = dayjs().toISOString(); // Lấy ngày hiện tại

    const contracts = await this.contractModel.find({
      status: {
        $in: [StatusEnum.CONFIRMED], // hợp đồng đã duyệt
      },
      startDate: { $lte: currentDate }, // startDate phải <= ngày hiện tại
      endDate: { $gte: currentDate }, // endDate phải >= ngày hiện tại
    });

    // Nếu không có hợp đồng nào, dừng hàm mà không làm gì
    if (!contracts || contracts.length === 0) {
      return;
    }

    for (const contract of contracts) {
      // Kiểm tra thông tin phòng
      const room = await this.roomModel.findById(contract.room.roomId);
      if (!room) {
        throw new NotFoundException(
          `Không tìm thấy phòng với ID ${contract.room.roomId}`,
        );
      }

      // Kiểm tra thông tin dãy phòng
      const roomBlock = await this.roomBlockModel.findById(room.roomBlockId);
      if (!roomBlock) {
        throw new NotFoundException(
          `Không tìm thấy dãy phòng với ID ${room.roomBlockId}`,
        );
      }

      // Kiểm tra thông tin loại phòng
      const roomType = await this.roomTypeModel.findById(room.roomTypeId);
      if (!roomType) {
        throw new NotFoundException(
          `Không tìm thấy loại phòng với ID ${room.roomTypeId}`,
        );
      }

      // Kiểm tra thông tin loại hợp đồng
      const contractType = await this.contractTypeModel.findById(
        contract.contractType.contractTypeId,
      );
      if (!contractType) {
        throw new NotFoundException(
          `Không tìm thấy loại hợp đồng với ID ${contract.contractType.contractTypeId}`,
        );
      }

      // Tính tổng số tiền thanh toán
      const totalAmount =
        contract.service.reduce((sum, service) => sum + service.price, 0) +
        contract.room.price;

      // Tạo bản ghi thanh toán
      const paymentData: CreateMonthlyPaymentInterface = {
        fullName: contract.fullName,
        studentCode: contract.studentCode,
        phoneNumber: contract.phoneNumber,
        email: contract.email,
        room: {
          roomId: new Types.ObjectId(room._id as string),
          roomName: room.roomName,
          floor: room.floor,
          roomType: roomBlock.name,
          roomBlock: roomType.type,
          price: contract.room.price,
        },
        service: contract.service.map((service) => ({
          serviceId: service.serviceId,
          name: service.name,
          price: service.price,
          createdAt: service.createdAt,
        })),
        term: contract.term.map((term) => ({
          termId: term.termId,
          content: term.content,
        })),
        contractType: {
          contractTypeId: new Types.ObjectId(contractType._id as string),
          contractTitle: contractType.title,
          duration: contract.contractType.duration,
          unit: contract.contractType.unit,
        },
        totalAmount: totalAmount,
        status: PaymentStatusEnum.UNPAID,
      };

      // Lưu bản ghi thanh toán vào cơ sở dữ liệu
      try {
        await this.paymentModel.create(paymentData);
      } catch (error) {
        throw new InternalServerErrorException(
          `Lỗi khi tạo bản ghi thanh toán tự động: ${error}`,
        );
      }
    }
  }

  async createPayments(): Promise<ResponseInterface> {
    const currentDate = dayjs().toISOString(); // Lấy ngày hiện tại

    const startOfMonth = dayjs().startOf('month').toDate(); // Đầu tháng
    const endOfMonth = dayjs().endOf('month').toDate(); // Cuối tháng

    const contracts = await this.contractModel.find({
      status: {
        $in: [StatusEnum.CONFIRMED], // hợp đồng đã duyệt
      },
      startDate: { $lte: currentDate }, // startDate phải <= ngày hiện tại
      endDate: { $gte: currentDate }, // endDate phải >= ngày hiện tại
    });

    // Nếu không có hợp đồng nào, dừng hàm mà không làm gì
    if (!contracts || contracts.length === 0) {
      return;
    }

    for (const contract of contracts) {
      // Kiểm tra nếu đã có hóa đơn trong tháng này
      const existingPayment = await this.paymentModel.findOne({
        createdAt: {
          $gte: startOfMonth, // Lớn hơn hoặc bằng đầu tháng
          $lte: endOfMonth, // Nhỏ hơn hoặc bằng cuối tháng
        },
      });

      if (existingPayment) {
        continue; // Nếu đã có hóa đơn, bỏ qua
      }

      // Kiểm tra thông tin phòng
      const room = await this.roomModel.findById(contract.room.roomId);
      if (!room) {
        throw new NotFoundException(
          `Không tìm thấy phòng với ID ${contract.room.roomId}`,
        );
      }

      // Kiểm tra thông tin dãy phòng
      const roomBlock = await this.roomBlockModel.findById(room.roomBlockId);
      if (!roomBlock) {
        throw new NotFoundException(
          `Không tìm thấy dãy phòng với ID ${room.roomBlockId}`,
        );
      }

      // Kiểm tra thông tin loại phòng
      const roomType = await this.roomTypeModel.findById(room.roomTypeId);
      if (!roomType) {
        throw new NotFoundException(
          `Không tìm thấy loại phòng với ID ${room.roomTypeId}`,
        );
      }

      // Kiểm tra thông tin loại hợp đồng
      const contractType = await this.contractTypeModel.findById(
        contract.contractType.contractTypeId,
      );
      if (!contractType) {
        throw new NotFoundException(
          `Không tìm thấy loại hợp đồng với ID ${contract.contractType.contractTypeId}`,
        );
      }

      // Tính tổng số tiền thanh toán
      const totalAmount =
        contract.service.reduce((sum, service) => sum + service.price, 0) +
        contract.room.price;

      // Tạo bản ghi thanh toán
      const paymentData: CreateMonthlyPaymentInterface = {
        fullName: contract.fullName,
        studentCode: contract.studentCode,
        phoneNumber: contract.phoneNumber,
        email: contract.email,
        room: {
          roomId: new Types.ObjectId(room._id as string),
          roomName: room.roomName,
          floor: room.floor,
          roomType: roomBlock.name,
          roomBlock: roomType.type,
          price: contract.room.price,
        },
        service: contract.service.map((service) => ({
          serviceId: service.serviceId,
          name: service.name,
          price: service.price,
          createdAt: service.createdAt,
        })),
        term: contract.term.map((term) => ({
          termId: term.termId,
          content: term.content,
        })),
        contractType: {
          contractTypeId: new Types.ObjectId(contractType._id as string),
          contractTitle: contractType.title,
          duration: contract.contractType.duration,
          unit: contract.contractType.unit,
        },
        totalAmount: totalAmount,
        status: PaymentStatusEnum.UNPAID,
      };

      // Lưu bản ghi thanh toán vào cơ sở dữ liệu
      try {
        await this.paymentModel.create(paymentData);
      } catch (error) {
        throw new InternalServerErrorException(
          `Lỗi khi tạo bản ghi thanh toán tự động: ${error}`,
        );
      }
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Đã tạo hóa đơn thành công.',
      messageCode: 'PAYMENTS_CREATED_SUCCESS',
    };
  }

  async findPayments(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
    filter: PaymentStatusEnum,
  ): Promise<{ data: PaymentType[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery: { [key: string]: any } = buildSearchQuery({
      fields: ['studentCode', 'fullName', 'email', 'phoneNumber'], // Các trường tìm kiếm
      searchTerm: search,
    });

    // Thêm điều kiện lọc theo trạng thái thanh toán
    if (filter === PaymentStatusEnum.PAID) {
      searchQuery.status = PaymentStatusEnum.PAID;
    } else if (filter === PaymentStatusEnum.UNPAID) {
      searchQuery.status = PaymentStatusEnum.UNPAID;
    }

    // Tùy chọn sắp xếp
    const sortDirections: { [field: string]: 'asc' | 'desc' } = {
      createdAt: sortDirection, // Sử dụng 'asc' hoặc 'desc' để phân loại
    };

    // Phân trang
    const { skip, limit: pageLimit } = paginateQuery(page, limit);

    // Sắp xếp
    const sortOptions = getSortOptions(sortDirections);

    // Tìm kiếm tài liệu
    const query = this.paymentModel.find(searchQuery);

    // Đếm tổng số tài liệu phù hợp
    const total = await this.paymentModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp
    const payments = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    // Tạo đối tượng meta
    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: payments, meta };
  }

  async findPaymentsByUser(
    page: number,
    limit: number,
    sortDirection: 'asc' | 'desc' = 'desc',
    filter: PaymentStatusEnum,
    studentCode: string,
  ): Promise<{ data: PaymentType[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery: { [key: string]: any } = {};

    // Thêm điều kiện lọc theo trạng thái thanh toán
    if (filter === PaymentStatusEnum.PAID) {
      searchQuery.status = PaymentStatusEnum.PAID;
    } else if (filter === PaymentStatusEnum.UNPAID) {
      searchQuery.status = PaymentStatusEnum.UNPAID;
    }

    // Thêm điều kiện lọc theo studentCode
    if (!studentCode) {
      throw new BadRequestException('Mã sinh viên không hợp lệ.');
    }
    searchQuery.studentCode = studentCode; // Tìm kiếm theo mã số sinh viên

    // Tùy chọn sắp xếp
    const sortDirections: { [field: string]: 'asc' | 'desc' } = {
      createdAt: sortDirection, // Sử dụng 'asc' hoặc 'desc' để phân loại
    };

    // Phân trang
    const { skip, limit: pageLimit } = paginateQuery(page, limit);

    // Sắp xếp
    const sortOptions = getSortOptions(sortDirections);

    // Tìm kiếm tài liệu
    const query = this.paymentModel.find(searchQuery);

    // Đếm tổng số tài liệu phù hợp
    const total = await this.paymentModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp
    const payments = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    // Tạo đối tượng meta
    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: payments, meta };
  }

  async findByIdPayment(id: string): Promise<PaymentType> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const payment = await this.paymentModel.findById(id);
    if (!payment) {
      throw new NotFoundException(`Không tìm thấy thanh toán với ID: ${id}`);
    }
    return payment;
  }
}
