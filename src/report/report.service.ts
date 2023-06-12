import { SensorsRawData } from "./entities/jhi-sensors-raw-data.entity";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { currentDateTime, formatDate } from "src/utils/date";
import { Connection, getConnection, LessThanOrEqual } from "typeorm";
import { SensorsSummaryDay } from "./entities/jhi-sensors-summary-day.entity";
import { Sensors } from "./entities/jhi-sensors.entity";
import { SensorsSummaryHour } from "./entities/jhi-sensors-summary-hour.entity";
import { getRepository } from "typeorm";
import { SensorsSummaryMonth } from "./entities/jhi-sensors-summary-month.entity";
import { SensorsSummaryWeek } from "./entities/jhi-sensors-summary-week.entity";
import { SensorsSummaryYear } from "./entities/jhi-sensors-summary-year.entity";

@Injectable()
export class ReportService {
    sensorSummary:any ;

    constructor(private readonly connection: Connection) { }

    async prepareBulkInsertSummaryReport(summary_type:string) {

        console.log('summary_type' ,summary_type);
        const dateTime = currentDateTime();
        const hour = dateTime.getHours().toString();
        const day = dateTime.getDate().toString();
        const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
        const year = dateTime.getFullYear().toString();

        const timestamp = new Date(dateTime).getTime();
        const format_time =  new Date(formatDate(timestamp,true)) ;
        console.log('format_time : ',format_time);


        console.log('hour :',hour);
        console.log('day :',day);
        console.log('month :',month);

        //Summary Hour
        let start_time = currentDateTime();
        start_time.setMinutes(0);
        start_time.setSeconds(0);
        let end_time = currentDateTime();
        end_time.setMinutes(59);
        end_time.setSeconds(59);

        // for real
        const startTime = start_time.toISOString().replace("T", " ").replace(".000Z", "");
        const endTime = end_time.toISOString().replace("T", " ").replace(".000Z", "");

        
        console.log("start time : ", startTime);
        console.log("end time : ", endTime);


        // Summary Week
        const day_start =  formatDate(dateTime.setDate(dateTime.getDate() - 6), true); ;
        const day_end =  dateTime.getDay() ;

        console.log('day_start : ',day_start);
        console.log('day_end : ',day_start);

        try {
            const sensors = await this.connection
                .getRepository(Sensors)
                .createQueryBuilder("jhi_sensors")
                .select("jhi_sensors.id")
                .getMany();

            for (const sensor of sensors) {
                const whereCondition =
                    summary_type === 'hour'
                    ? `sensor_time BETWEEN :startTime AND :endTime`
                    : summary_type === 'daily'
                    ? `day = :day`
                    : summary_type === 'week'
                    ? `day BETWEEN :dayStart AND :dayEnd`
                    : summary_type === 'month'
                    ? `month = :month`
                    : `year = :year`;

                const sensorResult = await this.connection
                    .createQueryBuilder()
                    .select(
                        summary_type == "hour"? "serial, sensor_serial, sensor_id, sensor_val, sensor_time":
                        summary_type == "daily"?"serial, sensor_serial, sensor_id, year, month, day":
                        summary_type=='week'?"serial, sensor_serial, sensor_id, year, month, day": 
                        summary_type == "month"? "serial, sensor_serial, sensor_id, year, month, day": "serial, sensor_serial, sensor_id, year, month") 
                    .addSelect(summary_type=='hour'?'ROUND(AVG(sensor_val), 2)':"ROUND(AVG(avg), 2)", "avgSensor")
                    .addSelect(summary_type=='hour'?"MAX(sensor_val)":"MAX(high)", "maxSensor")
                    .addSelect(summary_type=='hour'?"MIN(sensor_val)":"MIN(low)", "minSensor")
                    .from(
                        summary_type=='hour'?SensorsRawData:summary_type=='daily'?SensorsSummaryHour:
                        summary_type=='week'?SensorsSummaryDay:summary_type=='month'?SensorsSummaryDay:SensorsSummaryMonth,
                        summary_type=='hour'?'jhi_sensors_raw_data':
                        summary_type=='daily'?'jhi_sensors_summary_hour':
                        summary_type=='week'?'jhi_sensors_summary_day':
                        summary_type=='month'?'jhi_sensors_summary_day':'jhi_sensors_summary_month')
                    .where("sensor_id = :sensorId", { sensorId: sensor.id })
                    .andWhere(whereCondition, {
                        startTime:startTime,
                        endTime:endTime,
                        day: day,
                        dayStart: day_start,
                        dayEnd: day_end,
                        month: month,
                        year: year,
                    })
                    .groupBy(
                        summary_type == "hour"? "serial, sensor_serial, sensor_id, sensor_val, sensor_time":
                        summary_type == "daily"?"serial, sensor_serial, sensor_id, year, month, day":
                        summary_type=='week'?"serial, sensor_serial, sensor_id, year, month, day":
                        summary_type == "month"? "serial, sensor_serial, sensor_id, year, month, day": "serial, sensor_serial, sensor_id, year,month") 
                    .getRawMany();

                if (sensorResult.length > 0) {
                    const bulkInsertSensorData = sensorResult.map((data) => {
                        if(summary_type=='hour'){
                            const sensorSummaryHour = new SensorsSummaryHour;
                            sensorSummaryHour.serial = data.serial ;
                            sensorSummaryHour.serial = data.serial;
                            sensorSummaryHour.sensor_serial = data.sensor_serial;
                            sensorSummaryHour.sensor_id = data?.sensor_id;
                            sensorSummaryHour.year =parseInt(year);
                            sensorSummaryHour.month =parseInt(month);
                            sensorSummaryHour.day =parseInt(day);
                            sensorSummaryHour.hour = parseInt(hour);
                            sensorSummaryHour.event_time = currentDateTime();
                            sensorSummaryHour.avg = data.avgSensor;
                            sensorSummaryHour.high = data.maxSensor;
                            sensorSummaryHour.low = data.minSensor;
                            sensorSummaryHour.created_at = currentDateTime();
                            sensorSummaryHour.updated_at = currentDateTime();

                            return sensorSummaryHour;
                        }
                        else if(summary_type=='daily' || summary_type=='week'){

                           if(summary_type == 'daily'){
                            const sensorSummaryDay = new SensorsSummaryDay ;
                            sensorSummaryDay.serial = data.serial ;
                            sensorSummaryDay.serial = data.serial;
                            sensorSummaryDay.sensor_serial = data.sensor_serial;
                            sensorSummaryDay.sensor_id = data?.sensor_id;
                            sensorSummaryDay.year = parseInt(year);
                            sensorSummaryDay.month = parseInt(month);
                            sensorSummaryDay.day = parseInt(day);
                            sensorSummaryDay.event_time = currentDateTime();
                            sensorSummaryDay.avg = data.avgSensor;
                            sensorSummaryDay.high = data.maxSensor;
                            sensorSummaryDay.low = data.minSensor;
                            sensorSummaryDay.created_at = currentDateTime();
                            sensorSummaryDay.updated_at = currentDateTime();
                            return sensorSummaryDay;
                           }

                           if(summary_type == 'week'){
                            const sensorsSummaryWeek = new SensorsSummaryWeek;
                           
                            sensorsSummaryWeek.serial = data.serial ;
                            sensorsSummaryWeek.serial = data.serial;
                            sensorsSummaryWeek.sensor_serial = data.sensor_serial;
                            sensorsSummaryWeek.sensor_id = data?.sensor_id;
                            sensorsSummaryWeek.year = parseInt(year);
                            sensorsSummaryWeek.month = parseInt(month);
                            sensorsSummaryWeek.day =`${month} - ${day}`;
                            sensorsSummaryWeek.event_time = currentDateTime();
                            sensorsSummaryWeek.avg = data.avgSensor;
                            sensorsSummaryWeek.high = data.maxSensor;
                            sensorsSummaryWeek.low = data.minSensor;
                            sensorsSummaryWeek.created_at = currentDateTime();
                            sensorsSummaryWeek.updated_at = currentDateTime();
                            return sensorsSummaryWeek;
                           }

                        }
                        else if(summary_type == 'month'){
                            const  sensorsSummaryMonth = new SensorsSummaryMonth;
                            sensorsSummaryMonth.serial = data.serial ;
                            sensorsSummaryMonth.sensor_serial = data.sensor_serial;
                            sensorsSummaryMonth.sensor_id = data?.sensor_id;
                            sensorsSummaryMonth.year = parseInt(year);
                            sensorsSummaryMonth.month = parseInt(month);
                            sensorsSummaryMonth.event_time = currentDateTime();
                            sensorsSummaryMonth.avg = data.avgSensor;
                            sensorsSummaryMonth.high = data.maxSensor;
                            sensorsSummaryMonth.low = data.minSensor;
                            sensorsSummaryMonth.created_at = currentDateTime();
                            sensorsSummaryMonth.updated_at = currentDateTime();
                            return sensorsSummaryMonth;
                        }
                        
                        else if(summary_type=='year'){
                            const sensorSummaryYear = new SensorsSummaryMonth ;
                            sensorSummaryYear.serial = data.serial ;
                            sensorSummaryYear.serial = data.serial;
                            sensorSummaryYear.sensor_serial = data.sensor_serial;
                            sensorSummaryYear.sensor_id = data?.sensor_id;
                            sensorSummaryYear.year = parseInt(year);
                            sensorSummaryYear.month = parseInt(month);
                            sensorSummaryYear.event_time = currentDateTime();
                            sensorSummaryYear.avg = data.avgSensor;
                            sensorSummaryYear.high = data.maxSensor;
                            sensorSummaryYear.low = data.minSensor;
                            sensorSummaryYear.created_at = currentDateTime();
                            sensorSummaryYear.updated_at = currentDateTime();
                            return sensorSummaryYear;
                        }
                        else { 
                            console.log('error')
                        }
                    });

                    if (bulkInsertSensorData.length > 0) {
                        await this.insertSummaryData(bulkInsertSensorData,summary_type);
                    } else {
                        console.log("empty bulkInsertSensorHourData");
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async insertSummaryData(bulkInsertSensorData:object,summary_type:string) {
        try {

            console.log(bulkInsertSensorData);
            await getConnection()
                .getRepository(
                    summary_type=='hour'?SensorsSummaryHour :
                    summary_type == 'daily'?SensorsSummaryDay:
                    summary_type=='week'? SensorsSummaryWeek:
                    summary_type=='month'? SensorsSummaryMonth: SensorsSummaryYear)
                .save(bulkInsertSensorData);
            if(summary_type == 'daily'){
                this.removeOldDataEveryDay();
            }
            console.log("Insert Done.");
        } catch (error) {
            console.log(error);
        }
    }

    async removeOldDataEveryDay() {
        // ลบข้อมูลวันก่อนหน้านี้
        const previousDate = new Date(currentDateTime().getTime() - 24 * 60 * 60 * 1000);
        const del = await getConnection()
            .getRepository(SensorsRawData)
            .findOne({
                where: {
                    created_at: LessThanOrEqual(previousDate),
                },
            });
        if (del !== undefined) {
            const deleteResult = await getConnection()
                .createQueryBuilder()
                .delete()
                .from(SensorsRawData)
                .where("id = :id", { id: del?.id })
                .execute();

            if (deleteResult.affected > 0) {
                console.log("delete success!!");
            }
        }
    }
}
