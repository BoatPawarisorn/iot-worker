import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomerModule } from './customer/customer.module';
import { CronjobModule } from './cronjob/cronjob.module';
import { KafkaService } from './kafka.service';
import { MqttService } from './mqtt.service';
import { ConfigBoardsService } from './config-boards/config-boards.service';
import { BoardsAutoConfig } from './config-boards/entities/boards-auto-config.entity';
import { BoardsSchedule } from './config-boards/entities/boards-schedule.entity';
import { BoardsScheduleTime } from './config-boards/entities/boards-schedule-time.entity';
import { RedisService } from './redis.service';
import { DeviceConditionModule } from './device-conditions/jhi-device-conditions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.dev', '.env.stage', '.env.prod'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('THROTTLE_TTL'),
        limit: config.get<number>('THROTTLE_LIMIT'),
      }),
    }),
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    CustomerModule,
    CronjobModule,
    TypeOrmModule.forFeature([
      BoardsAutoConfig, BoardsSchedule, BoardsScheduleTime
    ]),
    DeviceConditionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    KafkaService,
    MqttService,
    ConfigBoardsService,
    RedisService,
  ],
})
export class AppModule { }
