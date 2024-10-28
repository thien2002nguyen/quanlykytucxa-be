import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonthlyVisit } from './interfaces/monthly-visit.interface';
import { MonthlyVisitDto } from './dto/get-monthly-visits.dto';

@Injectable()
export class MonthlyVisitService {
  constructor(
    @InjectModel('MonthlyVisit')
    private readonly monthlyVisitModel: Model<MonthlyVisit>,
  ) {}

  async findVisitsByYear(
    year: number,
  ): Promise<{ totalVisits: number; monthlyVisits: MonthlyVisitDto[] }> {
    const monthlyVisits = await this.monthlyVisitModel
      .find({ year })
      .sort({ month: 1 });

    const visitsByMonth: MonthlyVisitDto[] = Array.from(
      { length: 12 },
      (_, i) => {
        const visit = monthlyVisits.find((mv) => mv.month === i + 1);
        return {
          year,
          month: i + 1,
          visitCount: visit ? visit.visitCount : 0,
        };
      },
    );

    const totalVisits = visitsByMonth.reduce(
      (acc, visit) => acc + visit.visitCount,
      0,
    );

    return { totalVisits, monthlyVisits: visitsByMonth };
  }

  async incrementVisitCount(): Promise<MonthlyVisit> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0

    const monthlyVisit = await this.monthlyVisitModel.findOneAndUpdate(
      { year, month },
      { $inc: { visitCount: 1 } },
      { new: true, upsert: true },
    );

    return monthlyVisit;
  }
}
