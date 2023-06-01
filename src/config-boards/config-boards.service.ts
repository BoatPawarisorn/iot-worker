import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BoardsAutoConfigEntity } from './entities/boards-auto-config.entity';
import { BoardsScheduleEntity } from './entities/boards-schedule.entity';
import { BoardsScheduleTimeEntity } from './entities/boards-schedule-time.entity';
import { PageDto } from "../common/dtos/page.dto";
import { PageMetaDto } from "../common/dtos/page-meta.dto";
import { currentDateTime } from 'src/utils/date';

@Injectable()
export class ConfigBoardsService {
    constructor(
        @InjectRepository(BoardsAutoConfigEntity)
        private readonly boardsAutoConfigRepository: Repository<BoardsAutoConfigEntity>,
        @InjectRepository(BoardsScheduleEntity)
        private readonly boardsScheduleRepository: Repository<BoardsScheduleEntity>,
        @InjectRepository(BoardsScheduleTimeEntity)
        private readonly boardsScheduleTimeRepository: Repository<BoardsScheduleTimeEntity>,
    ) { }

    async findAllBoardsAutoConfig(pageOptionsDto): Promise<PageDto<BoardsAutoConfigEntity>> {
        const take = pageOptionsDto.take || 10;
        const skip = pageOptionsDto.skip || 0;
        const serial = pageOptionsDto.serial;
        const deviceId = pageOptionsDto.device_id;
        const slot = pageOptionsDto.slot;
        const apSerial = pageOptionsDto.ap_serial;
        const sensorId = pageOptionsDto.sensor_id;
        const status = pageOptionsDto.status;
        const confirm = pageOptionsDto.confirm;

        let query = {};
        if (serial != undefined && serial != null) {
            query['serial'] = Like(`%${serial}%`);
        }
        if (deviceId != undefined && deviceId != null) {
            query['device_id'] = deviceId;
        }
        if (slot != undefined && slot != null) {
            query['slot'] = slot;
        }
        if (apSerial != undefined && apSerial != null) {
            query['ap_serial'] = Like(`%${apSerial}%`);
        }
        if (sensorId != undefined && sensorId != null) {
            query['sensor_id'] = sensorId;
        }
        if (status != undefined && status != null) {
            query['status'] = status;
        }
        if (confirm != undefined && confirm != null) {
            query['confirm'] = confirm;
        }

        const [result, itemCount] = await this.boardsAutoConfigRepository.findAndCount({
            where: query,
            order: { id: pageOptionsDto.order },
            take: take,
            skip: skip
        });

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(result, pageMetaDto);
    }
    async updateStatusBoardsAutoConfig(status: string, serial: string, deviceId: string, slot: any): Promise<BoardsAutoConfigEntity> {
        const auto = await this.boardsAutoConfigRepository.findOne({
            where: {
                serial: serial,
                device_id: deviceId,
                slot: slot
            }
        });
        auto.status = status
        return await this.boardsAutoConfigRepository.save(auto);
    }
    async updateBoardsAutoConfig(id: number, boardsAutoConfig: any): Promise<BoardsAutoConfigEntity> {
        const auto = await this.boardsAutoConfigRepository.findOne(id);
        const deviceId = boardsAutoConfig?.device_id;
        const slot = boardsAutoConfig?.slot;
        const apSerial = boardsAutoConfig?.ap_serial;
        const serial = boardsAutoConfig?.serial;

        // config
        const start = boardsAutoConfig?.config?.start
        const finish = boardsAutoConfig?.config?.finish
        const val = boardsAutoConfig?.config?.val
        const sensorId = boardsAutoConfig?.config?.sensor_id
        const status = boardsAutoConfig?.config?.status

        if (deviceId != undefined && deviceId != null) {
            auto.device_id = deviceId
        }
        if (slot != undefined && slot != null) {
            auto.slot = slot
        }
        if (apSerial != undefined && apSerial != null) {
            auto.ap_serial = apSerial
        }
        if (serial != undefined && serial != null) {
            auto.serial = serial
        }
        if (start != undefined && start != null) {
            auto.start = start
        }
        if (finish != undefined && finish != null) {
            auto.finish = finish
        }
        if (val != undefined && val != null) {
            auto.val = val
        }
        if (sensorId != undefined && sensorId != null) {
            auto.sensor_id = sensorId
        }
        if (status != undefined && status != null) {
            auto.status = status
        }

        return await this.boardsAutoConfigRepository.save(auto);
    }

    async createBoardsAutoConfig(boardsAutoConfig: any): Promise<BoardsAutoConfigEntity> {
        const auto = new BoardsAutoConfigEntity();
        const deviceId = boardsAutoConfig?.device_id
        const slot = boardsAutoConfig?.slot;
        const apSerial = boardsAutoConfig?.ap_serial;
        const serial = boardsAutoConfig?.serial;

        // config
        const start = boardsAutoConfig?.config?.start
        const finish = boardsAutoConfig?.config?.finish
        const val = boardsAutoConfig?.config?.val
        const sensorId = boardsAutoConfig?.config?.sensor_id
        const status = boardsAutoConfig?.config?.status

        if (deviceId != undefined && deviceId != null) {
            auto.device_id = deviceId
        }
        if (slot != undefined && slot != null) {
            auto.slot = slot
        }
        if (apSerial != undefined && apSerial != null) {
            auto.ap_serial = apSerial
        }
        if (serial != undefined && serial != null) {
            auto.serial = serial
        }
        if (start != undefined && start != null) {
            auto.start = start
        }
        if (finish != undefined && finish != null) {
            auto.finish = finish
        }
        if (val != undefined && val != null) {
            auto.val = val
        }
        if (sensorId != undefined && sensorId != null) {
            auto.sensor_id = sensorId
        }
        if (status != undefined && status != null) {
            auto.status = status
        }

        auto.created_at = currentDateTime();

        return await this.boardsAutoConfigRepository.save(auto);
    }

    async findAllBoardsSchedule(pageOptionsDto): Promise<PageDto<BoardsScheduleEntity>> {
        const take = pageOptionsDto.take || 10;
        const skip = pageOptionsDto.skip || 0;
        const serial = pageOptionsDto.serial;
        const deviceId = pageOptionsDto.device_id;
        const slot = pageOptionsDto.slot;
        const status = pageOptionsDto.status;
        const confirm = pageOptionsDto.confirm;

        let query = {};
        if (serial != undefined && serial != null) {
            query['serial'] = Like(`%${serial}%`);
        }
        if (deviceId != undefined && deviceId != null) {
            query['device_id'] = deviceId;
        }
        if (slot != undefined && slot != null) {
            query['slot'] = slot;
        }
        if (status != undefined && status != null) {
            query['status'] = status;
        }
        if (confirm != undefined && confirm != null) {
            query['confirm'] = confirm;
        }

        const [result, itemCount] = await this.boardsScheduleRepository.findAndCount({
            where: query,
            order: { id: pageOptionsDto.order },
            take: take,
            skip: skip
        });

        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(result, pageMetaDto);
    }

    async updateStatusBoardsSchedule(status: string, serial: string, deviceId: string, slot: any): Promise<BoardsScheduleEntity> {
        const schedule = await this.boardsScheduleRepository.findOne({
            where: {
                serial: serial,
                device_id: deviceId,
                slot: slot
            }
        });
        schedule.status = status
        return await this.boardsScheduleRepository.save(schedule);
    }

    async updateBoardsSchedule(id: number, boardsSchedule: any): Promise<BoardsScheduleEntity> {
        const schedule = await this.boardsScheduleRepository.findOne(id);
        const mon = boardsSchedule?.mon
        const tue = boardsSchedule?.tue
        const wen = boardsSchedule?.wen
        const thu = boardsSchedule?.thu
        const fri = boardsSchedule?.fri
        const sat = boardsSchedule?.sat
        const sun = boardsSchedule?.sun

        if (mon != undefined && mon != null) {
            schedule.day1 = mon
        }
        if (tue != undefined && tue != null) {
            schedule.day2 = tue
        }
        if (wen != undefined && wen != null) {
            schedule.day3 = wen
        }
        if (thu != undefined && thu != null) {
            schedule.day4 = thu
        }
        if (fri != undefined && fri != null) {
            schedule.day5 = fri
        }
        if (sat != undefined && sat != null) {
            schedule.day6 = sat
        }
        if (sun != undefined && sun != null) {
            schedule.day7 = sun
        }

        schedule.updated_at = currentDateTime();

        return await this.boardsScheduleRepository.save(schedule);
    }

    async createBoardsSchedule(boardsSchedule: any): Promise<BoardsScheduleEntity> {
        const schedule = new BoardsScheduleEntity();
        const deviceId = boardsSchedule?.device_id
        const slot = boardsSchedule?.slot;
        const serial = boardsSchedule?.serial;
        const status = boardsSchedule?.config?.status
        const mon = boardsSchedule?.config?.day?.mon
        const tue = boardsSchedule?.config?.day?.tue
        const wen = boardsSchedule?.config?.day?.wen
        const thu = boardsSchedule?.config?.day?.thu
        const fri = boardsSchedule?.config?.day?.fri
        const sat = boardsSchedule?.config?.day?.sat
        const sun = boardsSchedule?.config?.day?.sun

        if (deviceId != undefined && deviceId != null) {
            schedule.device_id = deviceId
        }
        if (slot != undefined && slot != null) {
            schedule.slot = slot
        }
        if (serial != undefined && serial != null) {
            schedule.serial = serial
        }
        if (status != undefined && status != null) {
            schedule.status = status
        }
        if (mon != undefined && mon != null) {
            schedule.day1 = mon
        }
        if (tue != undefined && tue != null) {
            schedule.day2 = tue
        }
        if (wen != undefined && wen != null) {
            schedule.day3 = wen
        }
        if (thu != undefined && thu != null) {
            schedule.day4 = thu
        }
        if (fri != undefined && fri != null) {
            schedule.day5 = fri
        }
        if (sat != undefined && sat != null) {
            schedule.day6 = sat
        }
        if (sun != undefined && sun != null) {
            schedule.day7 = sun
        }

        schedule.created_at = currentDateTime();
        schedule.updated_at = currentDateTime();
        return await this.boardsScheduleRepository.save(schedule);
    }

    async deleteBoardsScheduleTime(id: number): Promise<boolean> {
        const boardScheduleTime = await this.boardsScheduleTimeRepository.findOne({ where: { boards_schedule_id: id } });
        if (!boardScheduleTime) {
            throw new NotFoundException(`Board Schedule Time with boards_schedule_id ${id} not found`);
        }
        const result = await this.boardsScheduleTimeRepository.delete({ id: boardScheduleTime.id })
        return result.affected > 0
    }

    async createBoardsScheduleTime(id: any, times: any): Promise<BoardsScheduleTimeEntity[]> {
        let scheduleTime: BoardsScheduleTimeEntity[]
        times.forEach((value: any, index: number) => {
            if (value['start'] != '' && value['end'] != '' && index < 5) {
                let start = value['start'].split(':');
                let end = value['end'].split(':');
                scheduleTime.push(
                    id,
                    start[0],
                    start[1],
                    end[0],
                    end[1],
                    value["status"]
                )
            }
        });
        return await this.boardsScheduleTimeRepository.save(scheduleTime);
    }
}

