import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { RoomType } from './interfaces/room-type.interface';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectModel('RoomType') private readonly roomTypeModel: Model<RoomType>,
  ) {}

  async createRoomType(
    createRoomTypeDto: CreateRoomTypeDto,
  ): Promise<RoomType> {
    const newRoomType = await this.roomTypeModel.create(createRoomTypeDto);
    return newRoomType;
  }

  async findRoomTypes(): Promise<RoomType[]> {
    return this.roomTypeModel.find().sort({ createdAt: -1 });
  }

  async findByIdRoomType(id: string): Promise<RoomType> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const roomType = await this.roomTypeModel.findById(id);
    if (!roomType) {
      throw new NotFoundException(`Không tìm thấy loại phòng với ID: ${id}`);
    }
    return roomType;
  }

  async updateRoomType(
    id: string,
    updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    const roomType = await this.roomTypeModel.findByIdAndUpdate(
      id,
      updateRoomTypeDto,
      {
        new: true,
      },
    );

    if (!roomType) {
      throw new NotFoundException(`Không tìm thấy loại phòng với ID ${id}`);
    }
    return roomType;
  }

  async removeRoomType(id: string): Promise<ResponseInterface> {
    const result = await this.roomTypeModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy loại phòng với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Loại phòng với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
