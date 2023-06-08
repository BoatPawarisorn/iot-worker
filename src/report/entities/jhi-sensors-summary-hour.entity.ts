import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';

@Entity('jhi_sensors_summary_hour')
export class SensorsSummaryHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 , nullable: true,default:'string'})
  @IsNotEmpty()
  @IsString()
  serial: string;

  @Column({ length: 20, nullable: true })
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
  @IsNumber()
  hour: number;

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
