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
import { DeviceConditionService } from 'src/device-conditions/jhi-device-conditions.service';
import { DeviceConditionModule } from 'src/device-conditions/jhi-device-conditions.module';
import { RedisService } from 'src/redis.service';
import { DeviceCondition } from 'src/device-conditions/entities/jhi-device-conditions.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Weather, Customer, Temperature, ProvinceGeo, BoardsAutoConfig, BoardsSchedule, BoardsScheduleTime, DeviceCondition]), HttpModule, CustomerModule, DeviceConditionModule],
  controllers: [],
  providers: [CronjobService, CustomerService, MqttService, ConfigBoardsService, KafkaService, DeviceConditionService, RedisService],
})
export class CronjobModule { }
