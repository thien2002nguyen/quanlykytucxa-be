import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { RoomBlock } from './interfaces/room-block.interface';
import { CreateRoomBlockDto } from './dto/create-room-block.dto';
import { UpdateRoomBlockDto } from './dto/update-room-block.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';

@Injectable()
export class RoomBlockService {
  constructor(
    @InjectModel('RoomBlock') private readonly roomBlockModel: Model<RoomBlock>,
  ) {}

  async createRoomBlock(
    createRoomBlockDto: CreateRoomBlockDto,
  ): Promise<RoomBlock> {
    const newRoomBlock = await this.roomBlockModel.create(createRoomBlockDto);
    return newRoomBlock;
  }

  async findRoomBlocks(): Promise<RoomBlock[]> {
    return this.roomBlockModel.find();
  }

  async findByIdRoomBlock(id: string): Promise<RoomBlock> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const roomBlock = await this.roomBlockModel.findById(id);
    if (!roomBlock) {
      throw new NotFoundException(`Không tìm thấy khối phòng với ID: ${id}`);
    }
    return roomBlock;
  }

  async updateRoomBlock(
    id: string,
    updateRoomBlockDto: UpdateRoomBlockDto,
  ): Promise<RoomBlock> {
    const roomBlock = await this.roomBlockModel.findByIdAndUpdate(
      id,
      updateRoomBlockDto,
      {
        new: true,
      },
    );

    if (!roomBlock) {
      throw new NotFoundException(`Không tìm thấy khối phòng với ID ${id}`);
    }
    return roomBlock;
  }

  async removeRoomBlock(id: string): Promise<ResponseInterface> {
    const result = await this.roomBlockModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy khối phòng với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Khối phòng với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
