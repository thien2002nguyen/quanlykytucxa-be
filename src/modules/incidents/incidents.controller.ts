import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { Incident } from './interfaces/incident.interface';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { MetaPagination } from 'src/common/constant';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { UserRequest } from 'src/interfaces/request.inrterface';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiBearerAuth()
@ApiTags('incidents')
@Controller('api/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Tạo sự cố mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sự cố đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createIncident(
    @Body() createIncidentDto: CreateIncidentDto,
    @Req() request: UserRequest,
  ): Promise<{ data: Incident }> {
    const userId = request.auth._id as string;

    const incident = await this.incidentsService.createIncident(
      userId,
      createIncidentDto,
    );
    return { data: incident };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách sự cố với bộ lọc và phân trang',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách sự cố.' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'sort', type: String, required: false })
  @ApiQuery({
    name: 'filter',
    type: String,
    required: false,
  })
  async findIncidents(
    @Query('page') page = 1,
    @Query('limit') limit = +process.env.LIMIT_RECORD || 10,
    @Query('sort') sort = 'desc',
  ): Promise<{ data: Incident[]; meta: MetaPagination }> {
    const validSortDirections: Array<'asc' | 'desc'> = ['asc', 'desc'];
    const sortDirection = validSortDirections.includes(sort as 'asc' | 'desc')
      ? (sort as 'asc' | 'desc')
      : 'desc';

    const { data, meta } = await this.incidentsService.findIncidents(
      +page,
      +limit,
      sortDirection,
    );
    return { data, meta };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sự cố theo ID hoặc Slug' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết sự cố.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sự cố.',
  })
  async findByIdIncident(@Param('id') id: string): Promise<{ data: Incident }> {
    const incident = await this.incidentsService.findByIdIncident(id);
    return { data: incident };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật sự cố theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin sự cố đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sự cố.',
  })
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @Req() request: UserRequest,
  ): Promise<{ data: Incident }> {
    const adminId = request.auth._id as string;

    const incident = await this.incidentsService.updateIncident(
      adminId,
      id,
      updateIncidentDto,
    );
    return { data: incident };
  }
}
