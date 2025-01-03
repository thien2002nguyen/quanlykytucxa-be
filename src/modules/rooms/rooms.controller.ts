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
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoomDto } from './dto/create-room.dto';
import { FilterRoomEnum, Room } from './interfaces/room.interface';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { MetaPagination } from 'src/common/constant';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('rooms')
@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo phòng mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Phòng đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<{ data: Room }> {
    const admin = await this.roomsService.createRoom(createRoomDto);
    return { data: admin };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách phòng với phân trang, tìm kiếm và lọc',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách phòng.' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    type: String,
    required: false,
    enum: FilterRoomEnum, // Thêm trạng thái all
  })
  @ApiQuery({
    name: 'isClient',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'roomTypeId',
    type: String,
    required: false,
  })
  async findRooms(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('search') search = '',
    @Query('sort') sort = 'desc',
    @Query('filter') filter: FilterRoomEnum = FilterRoomEnum.ALL, // Mặc định là all
    @Query('isClient') isClient: boolean = false,
    @Query('roomTypeId') roomTypeId = '',
  ): Promise<{ data: Room[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.roomsService.findRooms(
      +page,
      +limit,
      search,
      sortDirection,
      filter,
      isClient,
      roomTypeId,
    );
    return { data, meta };
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Lấy thông tin phòng theo ID hoặc Slug' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết phòng.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy phòng.',
  })
  async findOneRoom(
    @Param('idOrSlug') idOrSlug: string,
  ): Promise<{ data: Room }> {
    const room = await this.roomsService.findOneRoom(idOrSlug);
    return { data: room };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết phòng đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy phòng.',
  })
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<{ data: Room }> {
    const room = await this.roomsService.updateRoom(id, updateRoomDto);
    return { data: room };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa phòng theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Phòng đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy phòng.',
  })
  async removeRoom(@Param('id') id: string): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.roomsService.removeRoom(id);

    return {
      statusCode,
      message,
      messageCode,
    };
  }
}
