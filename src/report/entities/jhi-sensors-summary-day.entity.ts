import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';

@Entity('jhi_sensors_summary_day')
export class SensorsSummaryDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true ,default:'string'})
  serial: string;

  @Column({ length: 20, nullable: true,default:'string' })
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
  @IsNumber()
  month: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  day: number;

  @Column()
  @IsNotEmpty()
  @IsDate()
  event_time: Date;

  @Column({ length: 20 })
  @IsNotEmpty()
  @IsString()
  avg: string;

  @Column({ length: 20 })
  @IsNotEmpty()
  @IsString()
  high: string;

  @Column({ length: 20 })
  @IsNotEmpty()
  @IsString()
  low: string;

  @CreateDateColumn({ nullable: true, name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updated_at: Date;
}
