import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import {
  CreateMonthlyPaymentInterface,
  PaymentStatusEnum,
  Payment,
  TotalBillInterface,
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
import { Service } from '../services/interfaces/service.interface';
import { PayBillDto } from './dto/pay-bill.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Payment') private readonly paymentModel: Model<Payment>,
    @InjectModel('Contract') private contractModel: Model<Contract>,
    @InjectModel('ContractType') private contractTypeModel: Model<ContractType>,
    @InjectModel('Room') private roomModel: Model<Room>,
    @InjectModel('Service') private serviceModule: Model<Service>,
    @InjectModel('RoomType') private roomTypeModel: Model<RoomType>,
    @InjectModel('RoomBlock') private roomBlockModel: Model<RoomBlock>,
  ) {}

  @Cron('0 12 5 * *') // Chạy vào 12h trưa ngày 3 mỗi tháng
  async createMonthlyPayments(): Promise<void> {
    const currentDate = dayjs().toISOString(); // Lấy ngày hiện tại
    const startOfMonth = dayjs().startOf('month').toISOString(); // Đầu tháng
    const endOfMonth = dayjs().endOf('month').toISOString(); // Cuối tháng

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
      try {
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
        const room = await this.roomModel.findById(contract.roomId);
        if (!room) {
          throw new NotFoundException(
            `Không tìm thấy phòng với ID ${contract.roomId}`,
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
          contract.contractTypeId,
        );
        if (!contractType) {
          throw new NotFoundException(
            `Không tìm thấy loại hợp đồng với ID ${contract.contractTypeId}`,
          );
        }

        // Lấy danh sách serviceIds từ contract.services
        const serviceIds = contract.services.map((item) => item.serviceId);

        // Truy vấn chi tiết các dịch vụ từ `serviceIds`
        const services = await this.serviceModule.find({
          _id: { $in: serviceIds },
        }); // Lọc các dịch vụ theo `serviceIds`

        // Tạo bản ghi thanh toán
        const paymentData: CreateMonthlyPaymentInterface = {
          fullName: contract.fullName,
          studentCode: contract.studentCode,
          phoneNumber: contract.phoneNumber,
          email: contract.email,

          contractId: new Types.ObjectId(contract._id as string),

          room: {
            roomId: new Types.ObjectId(room._id as string),
            roomName: room.roomName,
            floor: room.floor,
            roomType: roomBlock.name,
            roomBlock: roomType.type,
            price: roomType.price,
          },

          services: services.map((service) => ({
            serviceId: new Types.ObjectId(service._id as string),
            name: service.name,
            price: service.price,
            createdAt:
              contract.services.find(
                (item) => item.serviceId.toString() === service._id.toString(),
              )?.createdAt || '',
          })),

          contractType: {
            contractTypeId: new Types.ObjectId(contractType._id as string),
            contractTitle: contractType.title,
            duration: contractType.duration,
            unit: contractType.unit,
          },

          status: PaymentStatusEnum.UNPAID,
        };

        // Lưu bản ghi thanh toán vào cơ sở dữ liệu
        await this.paymentModel.create(paymentData);
      } catch (error: any) {
        // Xử lý lỗi cho từng hợp đồng, có thể log lỗi để kiểm tra sau
        console.error(
          `Lỗi khi xử lý hợp đồng với ID ${contract._id}: ${error.message}`,
        );
      }
    }
  }

  async createPayments(adminId: string): Promise<ResponseInterface> {
    const currentDate = dayjs().toISOString(); // Lấy ngày hiện tại
    const startOfMonth = dayjs().startOf('month').toISOString(); // Đầu tháng
    const endOfMonth = dayjs().endOf('month').toISOString(); // Cuối tháng

    const contracts = await this.contractModel.find({
      status: { $in: [StatusEnum.CONFIRMED] }, // Hợp đồng đã duyệt
      startDate: { $lte: currentDate }, // startDate phải <= ngày hiện tại
      endDate: { $gte: currentDate }, // endDate phải >= ngày hiện tại
    });

    if (!contracts || contracts.length === 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Không có hợp đồng hợp lệ trong thời gian này.',
        messageCode: 'NO_VALID_CONTRACTS',
      };
    }

    for (const contract of contracts) {
      try {
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
        const room = await this.roomModel.findById(contract.roomId);
        if (!room) {
          throw new NotFoundException(
            `Không tìm thấy phòng với ID ${contract.roomId}`,
          );
        }

        const roomBlock = await this.roomBlockModel.findById(room.roomBlockId);
        if (!roomBlock) {
          throw new NotFoundException(
            `Không tìm thấy dãy phòng với ID ${room.roomBlockId}`,
          );
        }

        const roomType = await this.roomTypeModel.findById(room.roomTypeId);
        if (!roomType) {
          throw new NotFoundException(
            `Không tìm thấy loại phòng với ID ${room.roomTypeId}`,
          );
        }

        const contractType = await this.contractTypeModel.findById(
          contract.contractTypeId,
        );
        if (!contractType) {
          throw new NotFoundException(
            `Không tìm thấy loại hợp đồng với ID ${contract.contractTypeId}`,
          );
        }

        const serviceIds = contract.services.map((item) => item.serviceId);
        const services = await this.serviceModule.find({
          _id: { $in: serviceIds },
        });

        const paymentData: CreateMonthlyPaymentInterface = {
          fullName: contract.fullName,
          studentCode: contract.studentCode,
          phoneNumber: contract.phoneNumber,
          email: contract.email,

          contractId: new Types.ObjectId(contract._id as string),

          room: {
            roomId: new Types.ObjectId(room._id as string),
            roomName: room.roomName,
            floor: room.floor,
            roomType: roomBlock.name,
            roomBlock: roomType.type,
            price: roomType.price,
          },

          services: services.map((service) => ({
            serviceId: new Types.ObjectId(service._id as string),
            name: service.name,
            price: service.price,
            createdAt:
              contract.services.find(
                (item) => item.serviceId.toString() === service._id.toString(),
              )?.createdAt || '',
          })),

          contractType: {
            contractTypeId: new Types.ObjectId(contractType._id as string),
            contractTitle: contractType.title,
            duration: contractType.duration,
            unit: contractType.unit,
          },

          adminId: new Types.ObjectId(adminId),
          status: PaymentStatusEnum.UNPAID,
        };

        await this.paymentModel.create(paymentData);
      } catch (error) {
        console.error(`Lỗi khi xử lý hợp đồng với ID ${contract._id}:`, error);
        // Tiếp tục vòng lặp
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
  ): Promise<{ data: Payment[]; meta: MetaPagination }> {
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
    const query = this.paymentModel
      .find(searchQuery)
      .populate('adminId', 'userName email phoneNumber');

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
  ): Promise<{
    data: Payment[];
    meta: MetaPagination;
    totalBill: TotalBillInterface;
  }> {
    if (!studentCode) {
      throw new BadRequestException('Mã sinh viên không hợp lệ.');
    }

    // Sử dụng aggregation để tính tổng
    const result = await this.paymentModel.aggregate([
      // Lọc theo studentCode
      { $match: { studentCode } },

      // Gom nhóm và tính tổng
      {
        $group: {
          _id: null, // Không cần nhóm theo bất kỳ trường nào
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          remainingAmount: { $sum: '$remainingAmount' },
        },
      },
    ]);

    const totalBill: TotalBillInterface =
      result.length > 0
        ? {
            totalAmount: result[0].totalAmount || 0,
            paidAmount: result[0].paidAmount || 0,
            remainingAmount: result[0].remainingAmount || 0,
          }
        : { totalAmount: 0, paidAmount: 0, remainingAmount: 0 };

    // Xây dựng truy vấn tìm kiếm
    const searchQuery: { [key: string]: any } = {};

    // Thêm điều kiện lọc theo trạng thái thanh toán
    if (filter === PaymentStatusEnum.PAID) {
      searchQuery.status = PaymentStatusEnum.PAID;
    } else if (filter === PaymentStatusEnum.UNPAID) {
      searchQuery.status = PaymentStatusEnum.UNPAID;
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

    return { data: payments, meta, totalBill };
  }

  async findByIdPayment(id: string): Promise<Payment> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const payment = await this.paymentModel.findById(id);
    if (!payment) {
      throw new NotFoundException(`Không tìm thấy thanh toán với ID: ${id}`);
    }
    return payment;
  }

  async payBillById(
    paymentId: string,
    payBillDto: PayBillDto,
  ): Promise<Payment> {
    // Kiểm tra ID hợp lệ
    if (!isValidObjectId(paymentId)) {
      throw new NotFoundException(`ID ${paymentId} không hợp lệ.`);
    }

    // Tìm thông tin thanh toán theo ID
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(
        `Không tìm thấy thanh toán với ID: ${paymentId}`,
      );
    }

    const { paymentMethod, amount } = payBillDto;

    // Cập nhật phương thức thanh toán, số tiền và ngày thanh toán
    payment.paymentHistory.push({
      paymentMethod,
      amount,
      paymentDate: new Date().toISOString(),
    });

    // Lưu thông tin thanh toán đã cập nhật
    await payment.save();
    return payment;
  }
}
