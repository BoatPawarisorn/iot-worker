import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum LogicsEnum {
    LESS = 'less',
    MORE = 'more',
    EQUAL = 'equal',
    EQUAL_LESS = 'equal_less',
    EQUAL_MORE = 'equal_more',
}

enum TypeEnum {
    C = 'C',
    PERCENT = '%',
    PH = 'pH',
    LITER = 'l (liter)',
    MA = 'mA',
    LUX = 'lux',
    DB = 'dB',
    UG_PER_M3 = 'µg./m3',
    SECOND = 'Second',
    DEGREE = '°',
    CM = 'CM',
    V = 'V',
    M_PER_S = 'm/S',
    MM_PER_M = 'mm/M',
    BAR = 'bar',
    UW_PER_CM2 = 'uW/cm2',
    US_PER_CM = 'μs/cm',
    L_PER_MIN = 'L/min',
    W = 'W',
    A = 'A',
    PPM = 'ppm',
    MG_PER_KG = 'mg/kg',
    MG_PER_KG_TAB = 'mg/kg\t',
}

@Entity('jhi_device_conditions')
export class DeviceCondition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    device_id: number | null;

    @Column()
    sensor_id: number;

    @Column({ type: 'enum', enum: LogicsEnum })
    logics: LogicsEnum;

    @Column({ type: 'enum', enum: TypeEnum })
    type: TypeEnum;

    @Column({ length: 200 })
    details: string;
}
