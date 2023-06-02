import { Injectable, NotFoundException } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { currentDateTime } from 'src/utils/date';
import { ConfigBoardsService } from 'src/config-boards/config-boards.service'
import { BoardsSchedule } from './config-boards/entities/boards-schedule.entity';
import { getRepository, SelectQueryBuilder } from 'typeorm';
import { BoardsScheduleTime } from './config-boards/entities/boards-schedule-time.entity';
import { KafkaService } from './kafka.service';
@Injectable()
export class MqttService {
    constructor(
        private readonly configBoardsService: ConfigBoardsService,
        private readonly kafkaService: KafkaService
    ) { }
    async publishMessage(topic: string, message: string) {
        const client = mqtt.connect(`mqtt://${process.env.MQTT_IP}:1883`);
        client.publish(topic, message);
    }

    async publishMessageToBoard(message: any) {
        if (message.value.length > 0) {
            try {
                const server = mqtt.connect(`mqtt://${process.env.MQTT_IP}:1883`);
                let data = JSON.parse(message.value.toString());
                switch (data.type) {
                    case ("schedule"):
                        this.caseSchedule(message.value.toString());
                        if (data.config.status == "off") { // {"serial":"2011AMW2GS3K189","deviceId":1,"slot":1,"deviceName":"Water pump","type":"schedule","dt":1585211850249,"config":{"day":{"fri":false,"mon":false,"sat":false,"sun":false,"thu":false,"tue":false,"wen":false},"time":[{"end":"07:32","start":"07:30","status":"on"},{"end":"15:36","start":"15:34","status":"on"},{"end":"","start":"","status":""},{"end":"","start":"","status":""},{"end":"","start":"","status":""}],"status":"off"}}
                            const jobData = {
                                serial: data.serial,
                                sensor_serial: "",
                                slot: data.slot,
                                deviceId: + data.deviceId,
                                deviceName: + data.deviceId,
                                type: "custom",
                                from: "server",
                                dts: currentDateTime(),
                                dt: currentDateTime(),
                                config: {
                                    status: data.config.status
                                }
                            };

                            let topic = `/${data.serial}/setup`
                            let payloadData = JSON.stringify(jobData);

                            server.publish(topic, payloadData, () => {
                                console.log("MQTT broker message sent");
                                console.log("########### TYPE AUTO ##########");
                            });
                        }
                    case ("confirm"):
                        console.log("===========confirm=============");
                        console.log(data);
                        console.log("===========confirm=============");
                    case ("auto"):
                        console.log("########### TYPE AUTO ##########");
                        // get data from api and insert to db.
                        if (undefined == data.from) {
                            this.caseAuto(message.value.toString());
                            this.caseDisableAutoAndSchedule(message.value.toString());
                            if (data.config.status == "off") { // data {"serial":"2011KDRBXSF1UGZ","deviceId":1,"slot":1,"deviceName":"Water pump","type":"auto","dt":1584935134794,"config":{"sensor_id":1,"start":"","finish":"","val":31,"status":"off"}}
                                const jobData = {
                                    serial: data.serial,
                                    sensor_serial: "",
                                    slot: data.slot,
                                    deviceId: + data.deviceId,
                                    deviceName: + data.deviceId,
                                    type: "auto",
                                    from: "server",
                                    dts: currentDateTime(),
                                    dt: currentDateTime(),
                                    config: {
                                        status: data.config.status
                                    }
                                };

                                let topic = `/${data.serial}/setup`
                                let payloadData = JSON.stringify(jobData);

                                server.publish(topic, payloadData, () => {
                                    console.log("MQTT broker message sent");
                                    console.log("########### TYPE AUTO ##########");
                                });
                            }
                        } else {
                            data.dt = currentDateTime();
                            message.value = JSON.stringify(data);

                            let topic = `/${data.serial}/setup`

                            server.publish(topic, message.value, function () {
                                console.log("MQTT broker message sent");
                                console.log("########### TYPE AUTO ##########");
                            });
                        }
                    default:
                        // when type custome from server awair check another type is off.
                        if (data.type != "update" && data.type == "custom" && undefined == data.from) {
                            this.caseDisableAutoAndSchedule(message.value.toString());
                        }
                        data.dt = currentDateTime();
                        message.value = JSON.stringify(data);
                        let topic = `/${data.serial}/setup`
                        server.publish(topic, message.value, function () {
                            console.log("MQTT broker message sent");
                        });
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    async caseSchedule(data: any) {
        let dataObj = JSON.parse(data);
        try {
            const boardsSchedule = await this.configBoardsService.findAllBoardsSchedule({
                serial: dataObj?.serial,
                device_id: dataObj?.device_id,
                slot: dataObj?.slot,
                skip: 0,
                take: 1000
            })
            if (boardsSchedule.data.length > 0) {
                boardsSchedule.data.forEach((value, index) => {
                    console.log(value, index)
                    try {
                        this.configBoardsService.updateBoardsSchedule(value?.id, {
                            mon: dataObj?.config?.day?.mon,
                            tue: dataObj?.config?.day?.tue,
                            wen: dataObj?.config?.day?.wen,
                            thu: dataObj?.config?.day?.thu,
                            fri: dataObj?.config?.day?.fri,
                            sat: dataObj?.config?.day?.sat,
                            sun: dataObj?.config?.day?.sun
                        })
                        try {
                            this.configBoardsService.deleteBoardsScheduleTime(value?.id)
                            try {
                                this.configBoardsService.createBoardsScheduleTime(value?.id, dataObj?.config?.time)
                            } catch (error) {
                                console.log("createBoardsScheduleTime [error]: ", error);
                            }
                        } catch (error) {
                            console.log("deleteBoardsScheduleTime [error]: ", error);
                        }
                    } catch (error) {
                        console.log("updateBoardsSchedule [error]: ", error);
                    }
                })
            } else {
                try {
                    const boardsSchedule = await this.configBoardsService.createBoardsSchedule(dataObj)
                    const boardsScheduleId = boardsSchedule.id;
                    try {
                        this.configBoardsService.deleteBoardsScheduleTime(boardsScheduleId)
                        try {
                            this.configBoardsService.createBoardsScheduleTime(boardsScheduleId, dataObj?.config?.time)
                        } catch (error) {
                            console.log("createBoardsScheduleTime [error]: ", error);
                        }
                    } catch (error) {
                        console.log("deleteBoardsScheduleTime [error]: ", error);
                    }
                } catch (error) {
                    console.log("createBoardsSchedule [error]: ", error);
                }
            }


        } catch (error) {
            console.log("findAllBoardsSchedule [error]: ", error);
        }
    }

    async caseDisableAutoAndSchedule(data: any) {
        let dataObj = JSON.parse(data);
        try {
            if (dataObj?.serial !== undefined && dataObj?.deviceId !== undefined && dataObj?.slot !== undefined) {
                try {
                    this.configBoardsService.updateStatusBoardsSchedule("off", dataObj?.serial, dataObj?.deviceId, dataObj?.slot)
                } catch (error) {
                    console.log("updateStatusBoardsSchedule [error]: ", error);
                }
                try {
                    this.configBoardsService.updateStatusBoardsAutoConfig("off", dataObj?.serial, dataObj?.deviceId, dataObj?.slot)
                } catch (error) {
                    console.log("updateStatusBoardsAutoConfig [error]: ", error);
                }
            } else { }
        } catch (error) {
            console.log(error);
        }
    }

    async caseAuto(data: any) {
        let dataObj = JSON.parse(data);
        try {
            const boardsAutoConfig = await this.configBoardsService.findAllBoardsAutoConfig({
                serial: dataObj?.serial,
                device_id: dataObj?.device_id,
                slot: dataObj?.slot,
                ap_serial: dataObj?.ap_serial,
                skip: 0,
                take: 1000
            })

            if (boardsAutoConfig.data.length > 0) {
                boardsAutoConfig.data.forEach((value, index) => {
                    try {
                        this.configBoardsService.updateBoardsAutoConfig(value.id, value)
                    } catch (error) {
                        console.log("updateBoardsAutoConfig [error]: ", error)
                    }
                })
            } else {
                try {
                    this.configBoardsService.createBoardsAutoConfig(dataObj)
                } catch (error) {
                    console.log("createBoardsAutoConfig [error]: ", error)
                }
            }

        } catch (error) {
            console.log("findAllBoardsSchedule [error]: ", error)
        }
    }

    async getScheduleEnd(fieldName: string, timeHour: string, timeMin: string): Promise<any> {
        console.log("getScheduleEnd", fieldName, timeHour, timeMin);
        try {
            const result = await this.createQueryBuilder()
                .select([
                    'boards_schedule.id',
                    'boards_schedule.device_id',
                    'boards_schedule.slot',
                    'boards_schedule.serial',
                    'boards_schedule_time.start_h',
                    'boards_schedule_time.start_m',
                    'boards_schedule_time.end_h',
                    'boards_schedule_time.end_m',
                ])
                .from(BoardsSchedule, 'boards_schedule')
                .innerJoin(BoardsScheduleTime, 'boards_schedule_time', 'boards_schedule.id = boards_schedule_time.boards_schedule_id')
                .where('boards_schedule.' + fieldName + ' = :fieldValue', { fieldValue: 1 })
                .andWhere('boards_schedule.status = :status', { status: 'on' })
                .andWhere('boards_schedule_time.end_h = :timeHour', { timeHour })
                .andWhere('boards_schedule_time.end_m = :timeMin', { timeMin })
                .andWhere('boards_schedule_time.status = :status', { status: 'on' })
                .limit(100)
                .offset(0)
                .getRawMany();

            result.forEach(function (v: any, i: number) {
                console.log("value", v);
                if (undefined != v.id) {
                    try {
                        // Start Create Queue To Kafka
                        this.kafkaService.sendMessage("worker-to-kafka", {
                            serial: v.serial,
                            slot: v.slot,
                            deviceId: +v.device_id,
                            deviceName: +v.device_id,
                            type: "custom",
                            from: "server",
                            dts: currentDateTime(),
                            dt: currentDateTime(),
                            config: {
                                status: "off",
                                startHour: v.start_h,
                                startMin: v.start_m,
                                endHour: v.end_h,
                                endMin: v.end_m,
                            },
                        })
                        // End Queue
                    } catch (error) {
                        console.log(error)
                    }
                }
            });

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getScheduleStart(fieldName: string, timeHour: string, timeMin: string): Promise<any> {
        console.log("getScheduleStart", fieldName, timeHour, timeMin);
        try {
            const result = await this.createQueryBuilder()
                .select([
                    'boards_schedule.id',
                    'boards_schedule.device_id',
                    'boards_schedule.slot',
                    'boards_schedule.serial',
                    'boards_schedule_time.start_h',
                    'boards_schedule_time.start_m',
                    'boards_schedule_time.end_h',
                    'boards_schedule_time.end_m',
                ])
                .from(BoardsSchedule, 'boards_schedule')
                .innerJoin(BoardsScheduleTime, 'boards_schedule_time', 'boards_schedule.id = boards_schedule_time.boards_schedule_id')
                .where('boards_schedule.' + fieldName + ' = :fieldValue', { fieldValue: 1 })
                .andWhere('boards_schedule.status = :status', { status: 'on' })
                .andWhere('boards_schedule_time.start_h = :timeHour', { timeHour })
                .andWhere('boards_schedule_time.start_m = :timeMin', { timeMin })
                .andWhere('boards_schedule_time.status = :status', { status: 'on' })
                .limit(100)
                .offset(0)
                .getRawMany();

            result.forEach(function (v: any, i: number) {
                console.log("value", v);
                if (undefined != v.id) {
                    try {
                        // Start Create Queue To Kafka
                        this.kafkaService.sendMessage("worker-to-kafka", {
                            serial: v.serial,
                            slot: v.slot,
                            deviceId: +v.device_id,
                            deviceName: +v.device_id,
                            type: "custom",
                            from: "server",
                            dts: currentDateTime(),
                            dt: currentDateTime(),
                            config: {
                                status: "on",
                                startHour: v.start_h,
                                startMin: v.start_m,
                                endHour: v.end_h,
                                endMin: v.end_m,
                            },
                        })
                        // End Queue
                    } catch (error) {
                        console.log(error)
                    }
                }
            });

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    createQueryBuilder(): SelectQueryBuilder<BoardsSchedule> {
        return getRepository(BoardsSchedule).createQueryBuilder();
    }

}
