import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RoomBlockService } from './room-block.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoomBlockDto } from './dto/create-room-block.dto';
import { RoomBlock } from './interfaces/room-block.interface';
import { UpdateRoomBlockDto } from './dto/update-room-block.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('room-blocks')
@Controller('api/room-blocks')
export class RoomBlockController {
  constructor(private readonly roomBlockService: RoomBlockService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo khối phòng mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Khối phòng đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createRoomBlock(
    @Body() createRoomBlockDto: CreateRoomBlockDto,
  ): Promise<{ data: RoomBlock }> {
    const roomBlock =
      await this.roomBlockService.createRoomBlock(createRoomBlockDto);
    return { data: roomBlock };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khối phòng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách khối phòng.',
  })
  async findRoomBlocks(): Promise<{ data: RoomBlock[] }> {
    const roomBlocks = await this.roomBlockService.findRoomBlocks();
    return { data: roomBlocks };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khối phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết khối phòng.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khối phòng.',
  })
  async findByIdRoomBlock(
    @Param('id') id: string,
  ): Promise<{ data: RoomBlock }> {
    const roomBlock = await this.roomBlockService.findByIdRoomBlock(id);
    return { data: roomBlock };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin khối phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết khối phòng đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khối phòng.',
  })
  async updateRoomBlock(
    @Param('id') id: string,
    @Body() updateRoomBlockDto: UpdateRoomBlockDto,
  ): Promise<{ data: RoomBlock }> {
    const roomBlock = await this.roomBlockService.updateRoomBlock(
      id,
      updateRoomBlockDto,
    );
    return { data: roomBlock };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa khối phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Khối phòng đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khối phòng.',
  })
  async removeRoomBlock(@Param('id') id: string): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.roomBlockService.removeRoomBlock(id);
    return {
      statusCode,
      message,
      messageCode,
    };
  }
}
