import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      await this.connection.asPromise(); // Chờ kết nối hoàn tất
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed', error);
    }
  }
}
