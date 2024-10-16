import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Room } from './interfaces/room.interface';
import { CreateRoomDto } from './dto/create-room.dto';
import { buildSearchQuery } from 'src/utils/search.utils';
import { paginateQuery } from 'src/utils/pagination.utils';
import { getSortOptions } from 'src/utils/sort.utils';
import { generateSlug } from 'src/utils/slug.util';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';

@Injectable()
export class RoomsService {
  constructor(@InjectModel('Room') private readonly roomModel: Model<Room>) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const { roomName, floor } = createRoomDto;

    // Kiểm tra tính duy nhất của roomName và floor
    const existingRoom = await this.roomModel.findOne({ roomName, floor });

    if (existingRoom) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Phòng đã tồn tại.',
        messageCode: 'ROOM_ALREADY_EXISTS',
      });
    }

    const roomSlug = generateSlug(roomName, floor);

    // Lưu room mới
    const newRoom = await this.roomModel.create({
      ...createRoomDto,
      roomSlug, // Gán roomSlug vào DTO
    });

    return newRoom;
  }

  async findRooms(
    page: number,
    limit: number,
    search: string,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Room[]; meta: MetaPagination }> {
    // Xây dựng truy vấn tìm kiếm
    const searchQuery = buildSearchQuery({
      fields: ['roomName'],
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
    const query = this.roomModel.find(searchQuery);

    // Đếm tổng số tài liệu phù hợp
    const total = await this.roomModel.countDocuments(searchQuery);

    // Phân trang và sắp xếp
    const rooms = await query.skip(skip).limit(pageLimit).sort(sortOptions);

    const meta: MetaPagination = {
      page,
      limit: pageLimit,
      total,
    };

    return { data: rooms, meta };
  }

  async findByIdRoom(id: string): Promise<Room> {
    // Kiểm tra xem id có phải là một ObjectId hợp lệ không
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    // Tìm phòng theo ID
    const room = await this.roomModel.findById(id);
    if (!room) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy phòng với ID: ${id}`);
    }
    return room;
  }

  async findOneRoom(idOrSlug: string): Promise<Room> {
    // Kiểm tra xem idOrSlug có phải là một ObjectId hợp lệ hay không
    let room;
    if (Types.ObjectId.isValid(idOrSlug)) {
      // Nếu là ObjectId hợp lệ, tìm kiếm theo ID
      room = await this.roomModel.findById(idOrSlug);
    }

    // Nếu không tìm thấy theo ID hoặc không phải ObjectId, tìm theo slug
    if (!room) {
      room = await this.roomModel.findOne({ roomSlug: idOrSlug });
    }

    // Nếu không tìm thấy cả theo ID và slug, ném ra lỗi
    if (!room) {
      throw new NotFoundException(
        `Không tìm thấy phòng với ID hoặc slug: ${idOrSlug}`,
      );
    }

    return room;
  }

  async updateRoom(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    // Kiểm tra xem có tên phòng hay tầng được thay đổi thì slug phòng đó sẽ thay đổi theo
    if (updateRoomDto.roomName || updateRoomDto.floor) {
      const roomSlug = generateSlug(
        updateRoomDto.roomName,
        updateRoomDto.floor,
      );
      updateRoomDto.roomSlug = roomSlug; // Cập nhập slug mới
    }

    // Cập nhật thông tin phòng theo ID và DTO
    const room = await this.roomModel.findByIdAndUpdate(id, updateRoomDto, {
      new: true,
    });

    if (!room) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
    return room;
  }

  async removeRoom(id: string): Promise<ResponseInterface> {
    // Xóa phòng theo ID
    const result = await this.roomModel.findByIdAndDelete(id);
    if (!result) {
      // Nếu không tìm thấy, ném ra lỗi không tìm thấy
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Phòng với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
