import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      await this.connection.asPromise(); // Chờ kết nối hoàn tất
      console.log('Kết nối cơ sở dữ liệu thành công');
    } catch (error) {
      console.error('Kết nối cơ sở dữ liệu thất bại', error);
    }
  }
}
