import {
  Controller,
  Get,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MonthlyVisitService } from './monthly-visits.service';
import { MonthlyVisit } from './interfaces/monthly-visit.interface';
import { MonthlyVisitDto } from './dto/get-monthly-visits.dto';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('monthly-visits')
@Controller('api/monthly-visits')
export class MonthlyVisitController {
  constructor(private readonly monthlyVisitService: MonthlyVisitService) {}

  @Get(':year')
  @UseGuards(AuthModeratorOrAdminGuard)
  @ApiOperation({
    summary: 'Lấy thống kê lượt truy cập cho tất cả các tháng của năm',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thống kê lượt truy cập cho cả năm.',
  })
  async getVisitsByYear(
    @Param('year') year: number,
  ): Promise<{ data: MonthlyVisitDto[]; totalVisits: number }> {
    const { totalVisits, monthlyVisits } =
      await this.monthlyVisitService.findVisitsByYear(year);
    return { data: monthlyVisits, totalVisits };
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tăng số lượt truy cập cho tháng hiện tại' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lượt truy cập đã được cập nhật thành công.',
  })
  async incrementMonthlyVisits(): Promise<{ data: MonthlyVisit }> {
    const updatedVisit = await this.monthlyVisitService.incrementVisitCount();
    return { data: updatedVisit };
  }
}
