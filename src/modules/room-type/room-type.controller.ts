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
import { RoomTypeService } from './room-type.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { RoomType } from './interfaces/room-type.interface';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('room-types')
@Controller('api/room-types')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo loại phòng mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Loại phòng đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createRoomType(
    @Body() createRoomTypeDto: CreateRoomTypeDto,
  ): Promise<{ data: RoomType }> {
    const roomType =
      await this.roomTypeService.createRoomType(createRoomTypeDto);
    return { data: roomType };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách loại phòng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách loại phòng.',
  })
  async findRoomTypes(): Promise<{ data: RoomType[] }> {
    const roomTypes = await this.roomTypeService.findRoomTypes();
    return { data: roomTypes };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin loại phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết loại phòng.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy loại phòng.',
  })
  async findByIdRoomType(@Param('id') id: string): Promise<{ data: RoomType }> {
    const roomType = await this.roomTypeService.findByIdRoomType(id);
    return { data: roomType };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin loại phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết loại phòng đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy loại phòng.',
  })
  async updateRoomType(
    @Param('id') id: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<{ data: RoomType }> {
    const roomType = await this.roomTypeService.updateRoomType(
      id,
      updateRoomTypeDto,
    );
    return { data: roomType };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa loại phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Loại phòng đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy loại phòng.',
  })
  async removeRoomType(@Param('id') id: string): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.roomTypeService.removeRoomType(id);

    return {
      statusCode,
      message,
      messageCode,
    };
  }
}
