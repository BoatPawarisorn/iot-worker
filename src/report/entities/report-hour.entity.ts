import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('jhi_sensors_summary_hour')
export class ReportHour {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    serial:string;

    @Column()
    sensor_serial:string;

    @Column()
    sensor_id:string;

    @Column()
    year:string;

    @Column()
    month:string;

    @Column()
    day:string;

    @Column()
    hour:string;

    @Column()
    event_time:Date;

    @Column()
    avg:number;

    @Column()
    high:number;

    @Column()
    low:number;

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
