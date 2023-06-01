import { Injectable, NotFoundException } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { currentDateTime } from 'src/utils/date';
import { ConfigBoardsService } from 'src/config-boards/config-boards.service'

@Injectable()
export class MqttService {
    constructor(private readonly configBoardsService: ConfigBoardsService) { }
    async publishMessage(topic: string, message: string) {
        const client = mqtt.connect('mqtt://178.128.106.172:1883');
        client.publish(topic, message);
    }

    async publishMessageToBoard(message: any) {
        if (message.value.length > 0) {
            try {
                const server = mqtt.connect('mqtt://178.128.106.172:1883');
                let data = JSON.parse(message.value);
                switch (data.type) {
                    case ("schedule"):
                        // save to db
                        this.caseSchedule(message.value);
                        // สั่งปิดให้ทำงานทันที
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

                            let topic = `/${data.serial
                                }/setup`
                            let payloadData = JSON.stringify(jobData);
                            console.log("########### TYPE schedule off ##########");
                            console.log("\n\n##############undefined == data.from####################");
                            console.log("MQTT broker sending message to board ..\n");

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
                            this.caseAuto(message.value);
                            // console.log("########### Disable all another type ##########");
                            this.caseDisableAutoAndSchedule(message.value);

                            // สั่งปิดให้ทำงานทันที
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

                                let topic = `/${data.serial
                                    }/setup`
                                let payloadData = JSON.stringify(jobData);

                                console.log("########### TYPE AUTO ##########");
                                console.log("\n\n##############undefined == data.from####################");
                                console.log("MQTT broker sending message to board ..\n");

                                server.publish(topic, payloadData, () => {
                                    console.log("MQTT broker message sent");
                                    console.log("########### TYPE AUTO ##########");
                                });
                            }
                        } else {
                            data.dt = currentDateTime();
                            message.value = JSON.stringify(data);

                            let topic = `/${data.serial
                                }/setup`
                            console.log("\n\n#########################################");
                            console.log("MQTT broker sending message to board ..\n");

                            server.publish(topic, message.value, function () {
                                console.log("MQTT broker message sent");
                                console.log("########### TYPE AUTO ##########");
                            });
                        }
                    default:
                        // when type custome from server awair check another type is off.
                        if (data.type != "update" && data.type == "custom" && undefined == data.from) {
                            console.log("########### Type custom Dsiable all type ##########");
                            this.caseDisableAutoAndSchedule(message.value);
                        }
                        // mode datetime
                        data.dt = currentDateTime();
                        message.value = JSON.stringify(data);
                        // mode datetime

                        let topic = `/${data.serial
                            }/setup`

                        console.log("\n\n#########################################");
                        console.log("MQTT broker sending message to board ..\n");

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
}
