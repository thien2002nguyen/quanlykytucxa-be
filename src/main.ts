import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config'; // Import cấu hình Swagger
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Swagger từ tệp riêng
  setupSwagger(app);

  app.enableCors(); // <- cho phép CORS

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các thuộc tính không có trong DTO
      forbidNonWhitelisted: true, // Ném lỗi nếu có thuộc tính không hợp lệ
      transform: true, // Tự động chuyển đổi kiểu dữ liệu
    }),
  );

  // Lấy ConfigService từ ứng dụng
  const configService = app.get(ConfigService);

  // Lấy port từ biến môi trường
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/docs`);
}

bootstrap();