import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Incident, IncidentSchema } from 'src/schemas/incident.schema';
import { UsersModule } from '../users/users.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incident.name, schema: IncidentSchema },
    ]),
    UsersModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [MongooseModule], // Export để module khác có thể sử dụng schema Incident
})
export class IncidentsModule {}
