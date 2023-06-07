import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('jhi_sensors_summary_month')
export class ReportMonth {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    serial:string;

    @Column()
    sensor_serial:string;

    @Column()
    sensor_id:number;

    @Column()
    year:number;

    @Column()
    month:number;

    @Column()
    event_time:Date;

    @Column()
    avg:string;

    @Column()
    high:string;

    @Column()
    low:string;

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
