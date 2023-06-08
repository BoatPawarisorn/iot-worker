import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator";
@Entity('jhi_sensors_summary_month')
export class SensorsSummaryMonth {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 100,
        default:'string',
        nullable: true,
    })
    serial: string;

    @Column({
        type: "varchar",
        length: 20,
        nullable: true,
    })
    sensor_serial: string;

    @Column()
    sensor_id: number;

    @Column()
    year: number;

    @Column()
    month: number;

    @Column()
    event_time: Date;

    @Column({
        type: "varchar",
        length: 200,
    })
    avg: string;

    @Column({
        type: "varchar",
        length: 200,
    })
    high: string;

    @Column({
        type: "varchar",
        length: 200,
    })
    low: string;

    @CreateDateColumn({
        type: 'datetime',
        nullable: true,
        name: 'created_at',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'datetime',
        nullable: true,
        name: 'updated_at'
    })
    updated_at: Date;

}
