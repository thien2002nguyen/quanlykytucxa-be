import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student, StudentSchema } from 'src/schemas/student.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    UsersModule, // Sử dụng module admin để kiểm tra quyền truy cập
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
