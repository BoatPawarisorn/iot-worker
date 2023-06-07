import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportDaily } from './entities/report-daily.entity';
import { ReportHour } from './entities/report-hour.entity';
import { ReportMonth } from './entities/report-month.entity';
import { ReportYear } from './entities/report-year.entity';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [TypeOrmModule.forFeature([ReportDaily,ReportHour,ReportMonth,ReportYear]),HttpModule],
  controllers: [],
  providers: [ReportService]
})
export class ReportModule {}
