import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceCondition } from './entities/jhi-device-conditions.entity'
import { PageDto } from 'src/common/dtos/page.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';

@Injectable()
export class DeviceConditionService {
    constructor(
        @InjectRepository(DeviceCondition)
        private readonly deviceConditionRepository: Repository<DeviceCondition>,
    ) { }
    async findAll(pageOptionsDto): Promise<PageDto<DeviceCondition>> {
        const take = pageOptionsDto.take || 1000;
        const skip = pageOptionsDto.skip || 0;
        const deviceId = pageOptionsDto.device_id;
        const sensorId = pageOptionsDto.sensor_id;

        let query = {};

        if (deviceId != undefined && deviceId != null) {
            query['device_id'] = deviceId;
        }
        if (sensorId != undefined && sensorId != null) {
            query['sensor_id'] = sensorId;
        }

        const [result, itemCount] = await this.deviceConditionRepository.findAndCount({
            where: query,
            take: take,
            skip: skip,
        });

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(result, pageMetaDto);
    }
}
