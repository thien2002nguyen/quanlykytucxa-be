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
import { IntroductionService } from './introduction.service';
import { Introduction } from './interfaces/introduction.interface';
import { AuthModeratorOrAdminGuard } from 'src/guards/moderatorOrAdminAuth.guard';
import { UpdateIntroductionDto } from './dto/update-introduction.dto';

@ApiBearerAuth()
@ApiTags('introductions')
@Controller('api/introductions')
export class IntroductionController {
  constructor(private readonly introductionService: IntroductionService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin giới thiệu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin giới thiệu.',
  })
  async getIntroductions(): Promise<{ data: Introduction }> {
    const introductions = await this.introductionService.findIntroduction();
    return { data: introductions };
  }

  @Patch()
  @UseGuards(AuthModeratorOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin giới thiệu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin giới thiệu đã được cập nhật thành công.',
  })
  async updateIntroductionInfo(
    @Body() updateIntroductionDto: UpdateIntroductionDto,
  ): Promise<{ data: Introduction[] }> {
    const updatedIntroductions =
      await this.introductionService.updateIntroductionInfo(
        updateIntroductionDto,
      );
    return { data: updatedIntroductions };
  }
}
