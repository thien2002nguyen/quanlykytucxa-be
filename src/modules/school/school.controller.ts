import {
  Controller,
  Get,
  Patch,
  Body,
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
import { SchoolService } from './school.service';
import { School } from './interfaces/school.interface';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';

@ApiBearerAuth()
@ApiTags('schools')
@Controller('api/schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin trường học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin trường học.',
  })
  async getSchoolInfo(): Promise<{ data: School }> {
    const schoolInfo = await this.schoolService.findSchoolInfo();
    return { data: schoolInfo };
  }

  @Patch()
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin trường học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin trường học đã được cập nhật thành công.',
  })
  async updateSchoolInfo(
    @Body() updateSchoolDto: UpdateSchoolDto,
  ): Promise<{ data: School }> {
    const updatedSchool =
      await this.schoolService.updateSchoolInfo(updateSchoolDto);
    return { data: updatedSchool };
  }
}
