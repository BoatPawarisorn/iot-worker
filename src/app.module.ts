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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    KafkaService,
    MqttService
  ],
})
export class AppModule {}
