import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { UsersModule } from '../users/users.module';
import { ContractsModule } from '../contracts/contracts.module';
import { ServicesModule } from '../services/services.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    UsersModule, // Sử dụng module admin để kiểm tra quyền truy cập
    ContractsModule,
    ServicesModule,
    RoomsModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng
})
export class StudentsModule {}
