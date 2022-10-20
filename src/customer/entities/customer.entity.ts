import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate, BeforeSoftRemove } from 'typeorm';
import { currentDateTime } from 'src/utils/date';
@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn({
    name: 'id',
  })
  id: number;

  @Column({
    name: 'customer_id',
  })
  customerId: number;

  @Column({
    name: 'project_id',
  })
  projectId: number;

  @Column({
    type: String,
    length: 100,
    name: 'serial',
  })
  serial: string;

  @Column({
    type: String,
    name: 'detail',
  })
  detail: string;

  @Column({
    type: String,
    name: 'address',
  })
  address: string;

  @Column({
    name: 'province_id',
  })
  provinceId: number;

  @Column({
    type: String,
    length: 255,
    name: 'province_name',
  })
  provinceName: string;

  @Column({
    name: 'district_id',
  })
  districtId: number;

  @Column({
    type: String,
    length: 255,
    name: 'district_name',
  })
  districtName: string;

  @Column({
    name: 'subdistrict_id',
  })
  subdistrictId: number;

  @Column({
    type: String,
    length: 255,
    name: 'subdistrict_name',
  })
  subdistrictName: string;

  @Column({
    type: String,
    length: 255,
    name: 'lat',
  })
  lat: string;

  @Column({
    type: String,
    length: 255,
    name: 'lon',
  })
  lon: string;
  
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
