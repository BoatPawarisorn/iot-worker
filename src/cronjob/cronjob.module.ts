import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weather } from './entities/weather.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CronjobService } from './cronjob.service';
import { HttpModule } from'@nestjs/axios';
import { CustomerModule } from '../customer/customer.module';
import { CustomerService } from '../customer/customer.service';
import { Temperature } from './entities/temperature.entity';
import { ProvinceGeo } from './entities/province-geo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Weather, Customer, Temperature, ProvinceGeo]), HttpModule, CustomerModule],
  controllers: [],
  providers: [CronjobService, CustomerService],
})
export class CronjobModule {}
