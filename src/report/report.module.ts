import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorsSummaryDay } from './entities/jhi-sensors-summary-day.entity';
import { SensorsSummaryHour } from './entities/jhi-sensors-summary-hour.entity';
import { SensorsSummaryMonth } from './entities/jhi-sensors-summary-month.entity';
import { SensorsSummaryYear } from './entities/jhi-sensors-summary-year.entity';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [TypeOrmModule.forFeature([SensorsSummaryDay,SensorsSummaryHour,SensorsSummaryMonth,SensorsSummaryYear]),HttpModule],
  controllers: [],
  providers: [ReportService],
  exports:[ReportService]
})
export class ReportModule {}
