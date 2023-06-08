import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

@Entity({ name: 'jhi_sensors_raw_data' })
export class SensorsRawData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  serial: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sensor_serial: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  @IsString()
  sensor_id: string;

  @Column({ type: 'varchar', length: 20 })
  @IsNotEmpty()
  @IsString()
  sensor_val: string;

  @Column({ type: 'datetime' })
  @IsNotEmpty()
  @IsDate()
  sensor_time: Date;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
