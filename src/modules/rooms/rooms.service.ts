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
import { UpdateRoomDto } from './dto/update-room.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';
import { RoomBlock } from '../room-block/interfaces/room-block.interface';
import slugify from 'slugify';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel('Room') private readonly roomModel: Model<Room>,
    @InjectModel('RoomBlock') private readonly roomBlockModel: Model<RoomBlock>,
  ) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const { roomBlockId, floor, roomName } = createRoomDto;

    // Kiểm tra tính duy nhất của roomBlockId, floor, roomName
    const existingRoom = await this.roomModel.findOne({
      roomBlockId,
      floor,
      roomName,
    });

    if (existingRoom) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Phòng đã tồn tại.',
        messageCode: 'ROOM_ALREADY_EXISTS',
      });
    }

    // Tìm kiếm tên của RoomBlock dựa trên roomBlockId
    const roomBlock = await this.roomBlockModel.findById(roomBlockId);
    if (!roomBlock) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Không tìm thấy dãy phòng.',
        messageCode: 'ROOM_BLOCK_NOT_FOUND',
      });
    }

    const roomBlockName = roomBlock.name;

    // Nối chuỗi theo định dạng "tên dãy-số tầng-tên phòng"
    const roomSlug = slugify(`${roomBlockName}-${floor}-${roomName}`, {
      lower: true,
      locale: 'vi',
    });

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
    const query = this.roomModel
      .find(searchQuery)
      .populate('roomBlockId', 'name')
      .populate('roomTypeId', 'type price');

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
    const room = await this.roomModel
      .findById(id)
      .populate('roomBlockId', 'name')
      .populate('roomTypeId', 'type price');
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
      room = await this.roomModel
        .findOne({ roomSlug: idOrSlug })
        .populate('roomBlockId', 'name')
        .populate('roomTypeId', 'type price');
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
    if (
      updateRoomDto.roomBlockId ||
      updateRoomDto.roomName ||
      updateRoomDto.floor
    ) {
      const { roomBlockId, floor, roomName } = updateRoomDto;

      // Kiểm tra tính duy nhất của roomBlockId, floor, roomName
      const existingRoom = await this.roomModel.findOne({
        roomBlockId,
        floor,
        roomName,
      });

      if (existingRoom && existingRoom._id.toString() !== id) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Phòng đã tồn tại.',
          messageCode: 'ROOM_ALREADY_EXISTS',
        });
      }

      // Tìm kiếm tên của RoomBlock dựa trên roomBlockId
      const roomBlock = await this.roomBlockModel.findById(roomBlockId);
      if (!roomBlock) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Không tìm thấy dãy phòng.',
          messageCode: 'ROOM_BLOCK_NOT_FOUND',
        });
      }

      const roomBlockName = roomBlock.name;

      // Nối chuỗi theo định dạng "tên dãy-số tầng-tên phòng"
      const roomSlug = slugify(`${roomBlockName}-${floor}-${roomName}`, {
        lower: true,
        locale: 'vi',
      });

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
