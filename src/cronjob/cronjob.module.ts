import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weather } from './entities/weather.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CronjobService } from './cronjob.service';
import { HttpModule } from '@nestjs/axios';
import { CustomerModule } from '../customer/customer.module';
import { CustomerService } from '../customer/customer.service';
import { Temperature } from './entities/temperature.entity';
import { ProvinceGeo } from './entities/province-geo.entity';
import { MqttService } from 'src/mqtt.service';
import { ConfigBoardsService } from 'src/config-boards/config-boards.service';
import { KafkaService } from 'src/kafka.service';
import { BoardsAutoConfig } from 'src/config-boards/entities/boards-auto-config.entity';
import { BoardsSchedule } from 'src/config-boards/entities/boards-schedule.entity';
import { BoardsScheduleTime } from 'src/config-boards/entities/boards-schedule-time.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Weather, Customer, Temperature, ProvinceGeo, BoardsAutoConfig, BoardsSchedule, BoardsScheduleTime]), HttpModule, CustomerModule],
  controllers: [],
  providers: [CronjobService, CustomerService, MqttService, ConfigBoardsService, KafkaService],
})
export class CronjobModule { }
