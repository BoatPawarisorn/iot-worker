import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator";
@Entity('jhi_sensors_summary_year')
export class ReportYear {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 100,
    })
    @IsNotEmpty()
    @IsString()
    serial: string;

    @Column({
        type: "varchar",
        length: 20,
    })
    @IsString()
    sensor_serial: string;

    @Column()
    @IsNotEmpty()
    @IsNumber()
    sensor_id: number;

    @Column()
    @IsNotEmpty()
    @IsNumber()
    year: number;

    @Column()
    @IsNotEmpty()
    @IsDate()
    event_time: Date;

    @Column({
        type: "varchar",
        length: 20,
    })
    @IsNotEmpty()
    @IsString()
    avg: string;

    @Column({
        type: "varchar",
        length: 20,
    })
    @IsNotEmpty()
    @IsString()
    high: string;

    @Column({
        type: "varchar",
        length: 20,
    })
    @IsNotEmpty()
    @IsString()
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
