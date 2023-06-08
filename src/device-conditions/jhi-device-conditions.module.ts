import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceCondition } from './entities/jhi-device-conditions.entity';
import { DeviceConditionService } from './jhi-device-conditions.service';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceCondition])],
    providers: [DeviceConditionService],
    exports: [DeviceConditionService],
})
export class DeviceConditionModule { }