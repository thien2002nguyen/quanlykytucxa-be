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
import { ContractTypesService } from './contract-types.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateContractTypeDto } from './dto/create-contract-types.dto';
import { ContractType } from './interfaces/contract-types.interface';
import { UpdateContractTypeDto } from './dto/update-contract-types.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('contract-types')
@Controller('api/contract-types')
export class ContractTypesController {
  constructor(private readonly contractTypeService: ContractTypesService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo loại hợp đồng mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Loại hợp đồng đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createContractType(
    @Body() createContractTypeDto: CreateContractTypeDto,
  ): Promise<{ data: ContractType }> {
    const contractType = await this.contractTypeService.createContractType(
      createContractTypeDto,
    );
    return { data: contractType };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách loại hợp đồng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách loại hợp đồng.',
  })
  async findContractTypes(): Promise<{ data: ContractType[] }> {
    const contractTypes = await this.contractTypeService.findContractTypes();
    return { data: contractTypes };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin loại hợp đồng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết loại hợp đồng.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy loại hợp đồng.',
  })
  async findByIdContractType(
    @Param('id') id: string,
  ): Promise<{ data: ContractType }> {
    const contractType =
      await this.contractTypeService.findByIdContractType(id);
    return { data: contractType };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin loại hợp đồng theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết loại hợp đồng đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy loại hợp đồng.',
  })
  async updateContractType(
    @Param('id') id: string,
    @Body() updateContractTypeDto: UpdateContractTypeDto,
  ): Promise<{ data: ContractType }> {
    const contractType = await this.contractTypeService.updateContractType(
      id,
      updateContractTypeDto,
    );
    return { data: contractType };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa loại hợp đồng theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Loại hợp đồng đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy loại hợp đồng.',
  })
  async removeContractType(
    @Param('id') id: string,
  ): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.contractTypeService.removeContractType(id);
    return {
      statusCode,
      message,
      messageCode,
    };
  }
}
