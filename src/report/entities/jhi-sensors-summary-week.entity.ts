import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('jhi_sensors_summary_week')
export class SensorsSummaryWeek{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100})
  serial: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sensor_serial: string;

  @Column({ type: 'int' })
  sensor_id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'varchar', length: 20 })
  day: string;

  @Column({ type: 'datetime' })
  event_time: Date;

  @Column({ type: 'varchar', length: 20})
  avg: string;

  @Column({ type: 'varchar', length: 20})
  high: string;

  @Column({ type: 'varchar', length: 20})
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
