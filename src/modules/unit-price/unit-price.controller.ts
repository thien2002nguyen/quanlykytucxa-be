import {
  Controller,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UnitPriceService } from './unit-price.service';
import { UnitPrice } from './interfaces/unit-price.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { UpdateUnitPriceDto } from './dto/update-unit-price.dto';

@ApiBearerAuth()
@ApiTags('unit-prices')
@Controller('api/unit-prices')
export class UnitPriceController {
  constructor(private readonly unitPriceService: UnitPriceService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin đơn giá' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin đơn giá.',
  })
  async getUnitPrices(): Promise<{ data: UnitPrice }> {
    const unitPrices = await this.unitPriceService.findUnitPrice();
    return { data: unitPrices };
  }

  @Patch()
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin đơn giá' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin đơn giá đã được cập nhật thành công.',
  })
  async updateUnitPriceInfo(
    @Body() updateUnitPriceDto: UpdateUnitPriceDto,
  ): Promise<{ data: UnitPrice[] }> {
    const updatedUnitPrices =
      await this.unitPriceService.updateUnitPriceInfo(updateUnitPriceDto);
    return { data: updatedUnitPrices };
  }
}
