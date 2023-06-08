import { SensorsRawData } from './entities/jhi-sensors-raw-data.entity';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { currentDateTime, formatDate } from 'src/utils/date';
import { Connection, getConnection } from 'typeorm';
import { SensorsSummaryDay } from './entities/jhi-sensors-summary-day.entity';
import { Sensors } from './entities/jhi-sensors.entity';
import { SensorsSummaryHour } from './entities/jhi-sensors-summary-hour.entity';

@Injectable()
export class ReportService {

    constructor(private readonly connection: Connection) { }

    async prepareBulkInsertSummaryDay() {
        // console.log('---------------------------------');
        const dateTime = currentDateTime();
        const day = (dateTime.getDay() + 1).toString().padStart(2, '0');
        const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
        const year = dateTime.getFullYear().toString();

        const hour = dateTime.getHours().toString().padStart(2, '0');
        const minute = dateTime.getMinutes().toString().padStart(2, '0');
        const second = dateTime.getSeconds().toString().padStart(2, '0');
        const format_time = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

        try {
            const sensors = await this.connection
                .getRepository(Sensors)
                .createQueryBuilder('jhi_sensors')
                .select('jhi_sensors.id')
                .getMany()

            for (const sensor of sensors) {
                const sensorResult = await this.connection.createQueryBuilder()
                    .select('serial, sensor_serial, sensor_id, year, month, day')
                    .addSelect('ROUND(AVG(avg), 2)', 'avgSensor')
                    .addSelect('MAX(high)', 'maxSensor')
                    .addSelect('MIN(low)', 'minSensor')
                    .from(SensorsSummaryHour, 'jhi_sensors_summary_hour')
                    .where('sensor_id = :sensorId', { sensorId: sensor.id })
                    .andWhere('day = :day', { day })
                    .groupBy('serial, sensor_serial, sensor_id, year, month, day') // Include all non-aggregated columns in the GROUP BY clause
                    .getRawMany();

                if (sensorResult.length > 0) {
                    const bulkInsertSensorHourData = sensorResult.map((data) => {

                        const sensorSummary = new SensorsSummaryDay();
                        sensorSummary.serial = data.serial;
                        sensorSummary.sensor_serial = data.sensor_serial;
                        sensorSummary.sensor_id = data?.sensor_id;
                        sensorSummary.year = data.year;
                        sensorSummary.month = data.month;
                        sensorSummary.day = data.day;
                        sensorSummary.event_time = currentDateTime();
                        sensorSummary.avg = data.avgSensor;
                        sensorSummary.high = data.maxSensor;
                        sensorSummary.low = data.minSensor;
                        sensorSummary.created_at = currentDateTime();
                        sensorSummary.updated_at = currentDateTime();
                        return sensorSummary;
                    });

                    if (bulkInsertSensorHourData.length > 0) {

                        await this.insertSummaryHour(bulkInsertSensorHourData);

                    } else {
                        console.log('empty bulkInsertSensorHourData');
                    }
                }
            }
        }
        catch (error) {
            throw error;
        }
    }

    async insertSummaryHour(bulkInsertSensorHourData) {
        try {
            await getConnection().getRepository(SensorsSummaryDay).save(bulkInsertSensorHourData);
            this.removeOldDataEveryDay();
            console.log('Insert Done.');
        } catch (error) {
            console.log(error);
        }
    }

    async removeOldDataEveryDay() {
        const currentDate = new Date();
        const previousDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        await getConnection()
            .createQueryBuilder()
            .delete()
            .from(SensorsRawData)
            .where("created_at <= :previousDate", { previousDate }).execute();
    }
}
