import { Injectable, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Weather } from "./entities/weather.entity";
import { Cron, CronExpression } from "@nestjs/schedule";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import * as moment from "moment";
import { CustomerService } from "../customer/customer.service";
import { Temperature } from "./entities/temperature.entity";
import { ProvinceGeo } from "./entities/province-geo.entity";
import { currentDateTime } from "src/utils/date";
import { MqttService } from "src/mqtt.service";
import { ConfigBoardsService } from "src/config-boards/config-boards.service";
import { ReportService } from "src/report/report.service";
import { DeviceConditionService } from "src/device-conditions/jhi-device-conditions.service";
import { RedisService } from "src/redis.service";
import { BoardsAutoConfig } from "src/config-boards/entities/boards-auto-config.entity";
import { DeviceCondition } from "src/device-conditions/entities/jhi-device-conditions.entity";
import { KafkaService } from "src/kafka.service";

enum dataFrom {
  "admin" = "admin",
  "tmd" = "tmd",
}
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
@Injectable()
export class CronjobService {
  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
    @InjectRepository(Temperature)
    private readonly temperatureRepository: Repository<Temperature>,
    @InjectRepository(ProvinceGeo)
    private readonly provinceGeoRepository: Repository<ProvinceGeo>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly customerService: CustomerService,
    private readonly mqttService: MqttService,
    private readonly configBoardsService: ConfigBoardsService,
    private readonly reportService: ReportService,
    private readonly deviceConditionService: DeviceConditionService,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService
  ) {}

  // @Cron('*/20 * * * * *') // EVERY_DAY_IN_20SEC = '*/20 * * * * *' (for test)
  @Cron("0 03 * * *") // EVERY_DAY_AT_3AM = '0 03 * * *'
  async handleCronWeatherPerDay(): Promise<any> {
    console.log("[Weather] Cronjob daily Start.");
    const tmd_token = this.configService.get<string>("TMD_TOKER");
    const tmd_url = this.configService.get<string>("TMD_URL") + "/daily/at";
    const tmd_duration = this.configService.get<string>("TMD_DURATION");
    const isDate = moment().format("YYYY-MM-DD");
    const options = {
      headers: { Authorization: `Bearer ${tmd_token}` },
    };
    const fields = "rain,cond,ws10m,wd10m,tc_max,tc_min,psfc,slp,rh";
    const conditions = {
      1: "ท้องฟ้าแจ่มใส (Clear)",
      2: "มีเมฆบางส่วน (Partly cloudy)",
      3: "เมฆเป็นส่วนมาก (Cloudy)",
      4: "มีเมฆมาก (Overcast)",
      5: "ฝนตกเล็กน้อย (Light rain)",
      6: "ฝนปานกลาง (Moderate rain)",
      7: "ฝนตกหนัก (Heavy rain)",
      8: "ฝนฟ้าคะนอง (Thunderstorm)",
      9: "อากาศหนาวจัด (Very cold)",
      10: "อากาศหนาว (Cold)",
      11: "อากาศเย็น (Cool)",
      12: "อากาศร้อนจัด (Very hot)",
    };

    const customers = await this.customerService.findAll();
    if (customers) {
      console.log("[Weather] Cronjob daily processing.");
      for (const customer of customers) {
        if (customer.lat && customer.lon) {
          const lat = customer.lat;
          const lon = customer.lon;
          const projectId = customer.projectId;
          const customerId = customer.customerId;
          const forecasts = await this.httpService.axiosRef
            .get(
              `${tmd_url}?lat=${lat}&lon=${lon}&fields=${fields}&date=${isDate}&duration=${tmd_duration}`,
              options
            )
            .then((res) => {
              if (res.status && res.data) {
                return { status: res.status, data: res.data };
              }
              return { status: 500, data: [] };
            })
            .catch((error) => {
              return { status: 500, data: [] };
            });
          if (
            forecasts.status == 200 &&
            forecasts.data.WeatherForecasts[0].forecasts[0].data != undefined
          ) {
            const dataCreate = this.weatherRepository.create({
              title: "ข้อมูลจากกรมอุตุฯ",
              detail: "ข้อมูลจากกรมอุตุฯ",
              lat: lat,
              lon: lon,
              date: isDate,
              rainVolume:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.rain,
              weatherCondition:
                conditions[
                  forecasts.data.WeatherForecasts[0].forecasts[0].data.cond
                ],
              windSpeed:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.ws10m,
              windDirection:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.wd10m,
              maxTemperature:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.tc_max,
              minTemperature:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.tc_min,
              surfacePressure:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.psfc,
              relativeHumidity:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.rh,
              seaLevelPressure:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.slp,
              dataFrom: dataFrom["tmd"],
              customerId: customerId,
              projectId: projectId,
              createdBy: "Cron Job Daily",
            });
            await this.weatherRepository.insert(dataCreate);
          } else {
            console.log("[Weather] Cronjob daily Error.");
            Logger.error("Conecting lost from TMD.", forecasts.status);
          }
        }
        // console.log(moment().format('HH:mm:ss'));
        await sleep(1000);
      }
    }
    console.log("[Weather] Cronjob daily End.");
  }

  //Report Summary Hour
  @Cron("58 * * * *")
  async ReportSummaryHour() {
    this.reportService.prepareBulkInsertSummaryReport("hour");
  }

  // Report Summary Day
  @Cron("58 23 * * *")
  async ReportSummaryDay() {
    this.reportService.prepareBulkInsertSummaryReport("daily");
  }

  @Cron("0 0 * * 0")
  async ReportSummaryWeek() {
    this.reportService.prepareBulkInsertSummaryReport("week");
  }

  // Report Summary Month
  @Cron("0 0 1 * *")
  async ReportSummaryMonth() {
    this.reportService.prepareBulkInsertSummaryReport("month");
  }

  // Report Summary year
  // @Cron(CronExpression.EVERY_YEAR)
  @Cron('50 23 31 DEC *')
  async ReportSummaryYear() {
    console.log('report year');
    this.reportService.prepareBulkInsertSummaryReport('year');
  }

  // @Cron('0 */5 * * * *') // (for test)
  @Cron("0 10 * * * *")
  async handleCronTemperaturePerHourly(): Promise<any> {
    console.log("[Temperature] Cronjob hourly Start.");
    const tmd_token = this.configService.get<string>("TMD_TOKER");
    const tmd_url = this.configService.get<string>("TMD_URL") + "/hourly/at";
    const tmd_duration = this.configService.get<string>("TMD_DURATION");
    const isDate = moment().format("YYYY-MM-DD");
    const isHour = moment().format("H");
    const options = {
      headers: { Authorization: `Bearer ${tmd_token}` },
    };
    const fields = "tc";
    const geoGet = await this.provinceGeoRepository.find();
    if (geoGet) {
      console.log("[Temperature] Cronjob hourly processing.");
      for (const geo of geoGet) {
        if (geo.provinceLat && geo.provinceLon) {
          const lat = geo.provinceLat;
          const lon = geo.provinceLon;
          const forecasts = await this.httpService
            .get(
              `${tmd_url}?lat=${lat}&lon=${lon}&fields=${fields}&date=${isDate}&hour=${isHour}&duration=${tmd_duration}`,
              options
            )
            .toPromise();
          if (forecasts.status == 200) {
            const dataCreate = this.temperatureRepository.create({
              provinceId: geo.provinceId,
              temperature:
                forecasts.data.WeatherForecasts[0].forecasts[0].data.tc,
            });
            await this.temperatureRepository.insert(dataCreate);
          } else {
            Logger.error("Conecting lost from TMD.", forecasts.statusText);
          }
        }
        // console.log(moment().format('HH:mm:ss'));
        await sleep(1000);
      }
    }
    console.log("[Temperature] Cronjob hourly End.");
  }

  @Cron("1 * * * * *") // Cron schedule for running every second
  async handleSchedule() {
    const dateTime = currentDateTime();
    const dayOfWeek = dateTime.getDay().toString();
    // console.log('dayOfWeek', dayOfWeek);
    const timeCurrent = dateTime.getHours() + ":" + dateTime.getMinutes();
    // console.log('timeCurrent', timeCurrent);
    const timeHour = dateTime.getHours().toString();
    // console.log('timeHour', timeHour);
    const timeMin = dateTime.getMinutes().toString();
    // console.log('timeMin', timeMin);
    const timeSec = dateTime.getSeconds().toString();
    // console.log('timeSec', timeSec);

    if (1 !== +timeSec) {
      return;
    }

    // console.log("dayOfWeek", dayOfWeek);
    let dNum = +dayOfWeek;
    if (dNum === 0) {
      dNum = 7;
    }
    const fieldName = `day${dNum}`;

    await this.mqttService.getScheduleStart(fieldName, timeHour, timeMin);
    await this.mqttService.getScheduleEnd(fieldName, timeHour, timeMin);
  }

  @Cron("* * * * *")
  async handleBoardAutoConfig() {
    try {
      const result = await this.configBoardsService.findAllBoardsAutoConfig({
        take: 1000,
        status: "on",
      });
      if (result?.data?.length > 0) {
        result?.data?.forEach(async (boardsAutoConfig, i) => {
          const conditions = await this.deviceConditionService.findAll({
            device_id: boardsAutoConfig?.device_id,
            sensor_id: boardsAutoConfig?.sensor_id,
          });
          this.redisService.getAllRedis(
            boardsAutoConfig?.serial?.toString(),
            (
              err: Error | null,
              obj: {
                [key: string]: string;
              }
            ) => {
              if (conditions?.data?.length > 0) {
                try {
                  conditions?.data?.forEach(async (condition, index) => {
                    if (
                      boardsAutoConfig.device_id ==
                      condition.device_id.toString()
                    ) {
                      let checkIsSensorWireless = 0;
                      if (null != obj) {
                        for (const [sensorIndex, sensorData] of Object.entries(
                          obj
                        )) {
                          let apSerial = sensorIndex;
                          if (apSerial.length == 12) {
                            checkIsSensorWireless = 1;
                            boardsAutoConfig.ap_serial = apSerial;
                            let sensorDataInner: { [key: string]: any } =
                              JSON.parse(sensorData);
                            for (const [sdIndex, sdData] of Object.entries(
                              sensorDataInner
                            )) {
                              if (
                                boardsAutoConfig.ap_serial ==
                                  sdData?.sensor_serial &&
                                boardsAutoConfig.sensor_id == sdData?.items_id
                              ) {
                                await this.checkLogics(
                                  sdData,
                                  boardsAutoConfig,
                                  condition
                                );
                              }
                            }
                          } else {
                            break;
                          }
                        }
                      }
                      if (
                        null != obj &&
                        checkIsSensorWireless == 0 &&
                        obj.hasOwnProperty(boardsAutoConfig.sensor_id)
                      ) {
                        let objCheck = JSON.parse(
                          obj[boardsAutoConfig.sensor_id]
                        );
                        console.log(
                          "########### Normal BOARD #################"
                        );
                        await this.checkLogics(
                          objCheck,
                          boardsAutoConfig,
                          condition
                        );
                      }
                    }
                  });
                } catch (error) {
                  console.log(error);
                }
              }
            }
          );
        });
      }
    } catch (error) {
      console.log("findAllBoardsAutoConfig [error]: ", error);
    }
  }

  async checkLogics(
    data: any,
    boardsAutoConfig: BoardsAutoConfig,
    condition: DeviceCondition
  ) {
    let val = boardsAutoConfig.val;
    let status = "off";
    console.log(
      `result_sensor ${condition.logics}, val ${(data.result_sensor, val)}`
    );
    switch (condition.logics) {
      case "less":
        if (data?.result_sensor < val) {
          status = "on";
        }
      case "more":
        if (data?.result_sensor > val) {
          status = "on";
        }
      case "equal":
        if (data?.result_sensor == val) {
          status = "on";
        }
      case "equal_less":
        if (data?.result_sensor <= val) {
          status = "on";
        }
      case "equal_more":
        if (data?.result_sensor >= val) {
          status = "on";
        }
      default:
        console.log("Nothing match any case.");
    }

    try {
      // Start Create Queue To Kafka
      this.kafkaService.sendMessage("worker-to-kafka", {
        serial: data.serial,
        slot: data.slot,
        deviceId: +data.device_id,
        deviceName: +data.device_id,
        type: "auto",
        from: "server",
        dts: currentDateTime(),
        dt: currentDateTime(),
        config: {
          status: status,
        },
      });
      // End Queue
    } catch (error) {
      console.log(error);
    }
  }
}
