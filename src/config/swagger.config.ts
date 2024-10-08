import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  // Cấu hình Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BE - Quản lý ký túc xá')
    .setDescription('Đồ án tốt nghiệp - Nguyễn Cảnh Thiện - 2051220003')
    .setVersion('1.0')
    .addBearerAuth() // Thêm Bearer token auth
    .build();

  // Tạo tài liệu Swagger từ cấu hình
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Thiết lập Swagger UI tại endpoint '/docs'
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true, // Giữ token trong localStorage
    },
  });
}
