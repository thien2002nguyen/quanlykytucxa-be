import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSchoolDto {
  @ApiPropertyOptional({
    description: 'Tên trường học',
    example: 'Trường Đại Học Kiến Trúc Đà Nẵng',
  })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiPropertyOptional({
    description: 'URL Zalo của trường',
    example: 'https://zalo.me/123456789',
  })
  @IsOptional()
  @IsString()
  zaloUrl?: string;

  @ApiPropertyOptional({
    description: 'URL Facebook của trường',
    example: 'https://facebook.com/archuniversitydanang',
  })
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional({
    description: 'URL Google Maps của trường',
    example:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.641108987922!2d108.21948517490327!3d16.032187484641977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219ee598df9c5%3A0xaadb53409be7c909!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaeG6v24gdHLDumMgxJDDoCBO4bq1bmc!5e0!3m2!1svi!2s!4v1729842738904!5m2!1svi!2s',
  })
  @IsOptional()
  @IsString()
  googleMapUrl?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại của trường',
    example: '0236123456',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email của trường',
    example: 'info@dau.edu.vn',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ của trường',
    example: '566 Núi Thành, Hoà Cường Nam, Hải Châu, Đà Nẵng, Việt Nam',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Slogan của trường',
    example: 'Sáng tạo, Đổi mới, Hội nhập.',
  })
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional({
    description: 'Giờ làm việc của trường',
    example: 'Thứ 2 đến Thứ 6, 7:30 - 17:30',
  })
  @IsOptional()
  @IsString()
  timeWork?: string;

  // Thêm các trường nội quy và hướng dẫn dưới dạng editor
  @ApiPropertyOptional({
    description: 'Nội quy quy định của ký túc xá',
    example: '<p>Trường hợp vi phạm sẽ bị xử lý nghiêm khắc.</p>',
  })
  @IsOptional()
  @IsString()
  rulesAndRegulations?: string;

  @ApiPropertyOptional({
    description: 'Hướng dẫn',
    example:
      '<p>Vui lòng làm theo các hướng dẫn dưới đây để đăng ký phòng.</p>',
  })
  @IsOptional()
  @IsString()
  guidelines?: string;
}
