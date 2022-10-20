import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate, BeforeSoftRemove } from 'typeorm';
import { currentDateTime } from 'src/utils/date';

export enum dataFrom {
  'admin' = 'admin',
  'tmd' = 'tmd',
} 
@Entity('weather')
export class Weather {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: String,
    length: 255,
    name: 'title',
  })
  title: string;

  @Column({
    type: String,
    nullable: true,
    name: 'detail',
  })
  detail: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'lat',
  })
  lat: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'lon',
  })
  lon: string;

  @Column({
    type: 'datetime',
    nullable: true,
    name: 'date',
  })
  date : Date;

  @Column({
    type: String,
    nullable: true,
    name: 'rain_volume',
  })
  rainVolume: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'weather_condition',
  })
  weatherCondition: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'wind_speed',
  })
  windSpeed: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'wind_direction',
  })
  windDirection: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'max_temperature',
  })
  maxTemperature: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'min_temperature',
  })
  minTemperature: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'surface_pressure',
  })
  surfacePressure: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'sea_level_pressure',
  })
  seaLevelPressure: string;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'relative_humidity',
  })
  relativeHumidity: string;

  @Column({
    name: 'data_from',
  })
  dataFrom: dataFrom;

  @Column({
    name: 'customer_id',
  })
  customerId: number;

  @Column({
    name: 'project_id',
  })
  projectId: number;
  
  @CreateDateColumn({
    type: 'datetime', 
    nullable: true, 
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'created_by',
  })
  createdBy: string;

  @UpdateDateColumn({
    type: 'datetime', 
    nullable: true, 
    name: 'updated_at'
  })
  updatedAt: Date;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'updated_by',
  })
  updatedBy: string;
  
  @DeleteDateColumn({
    type: 'datetime',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt: Date;

  @Column({
    type: String,
    length: 255,
    nullable: true,
    name: 'deleted_by',
  })
  deletedBy: string;

  @BeforeInsert()
  createDates() {
      this.createdAt = currentDateTime()
  }

  @BeforeUpdate()
  updateDates() {
      this.updatedAt = currentDateTime()
  }

  @BeforeSoftRemove()
  deleteDates() {
      this.deletedAt = currentDateTime()
  }
}
