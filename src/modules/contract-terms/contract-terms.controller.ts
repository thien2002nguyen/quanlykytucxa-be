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
import { ContractTermsService } from './contract-terms.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateContractTermDto } from './dto/create-contract-terms.dto';
import { ContractTerm } from './interfaces/contract-terms.interface';
import { UpdateContractTermDto } from './dto/update-contract-terms.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('contract-terms')
@Controller('api/contract-terms')
export class ContractTermsController {
  constructor(private readonly contractTermService: ContractTermsService) {}

  @Post()
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Tạo điều khoản mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Điều khoản đã được tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ.',
  })
  async createContractTerm(
    @Body() createContractTermDto: CreateContractTermDto,
  ): Promise<{ data: ContractTerm }> {
    const contractTerm = await this.contractTermService.createContractTerm(
      createContractTermDto,
    );
    return { data: contractTerm };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách điều khoản' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách điều khoản.',
  })
  async findContractTerms(): Promise<{ data: ContractTerm[] }> {
    const contractTerms = await this.contractTermService.findContractTerms();
    return { data: contractTerms };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin điều khoản theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết điều khoản.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy điều khoản.',
  })
  async findByIdContractTerm(
    @Param('id') id: string,
  ): Promise<{ data: ContractTerm }> {
    const contractTerm =
      await this.contractTermService.findByIdContractTerm(id);
    return { data: contractTerm };
  }

  @Put(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin điều khoản theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết điều khoản đã được cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy điều khoản.',
  })
  async updateContractTerm(
    @Param('id') id: string,
    @Body() updateContractTermDto: UpdateContractTermDto,
  ): Promise<{ data: ContractTerm }> {
    const contractTerm = await this.contractTermService.updateContractTerm(
      id,
      updateContractTermDto,
    );
    return { data: contractTerm };
  }

  @Delete(':id')
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Xóa điều khoản theo ID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Điều khoản đã được xóa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy điều khoản.',
  })
  async removeContractTerm(
    @Param('id') id: string,
  ): Promise<ResponseInterface> {
    const { statusCode, message, messageCode } =
      await this.contractTermService.removeContractTerm(id);
    return {
      statusCode,
      message,
      messageCode,
    };
  }
}
