import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { currentDateTime } from 'src/utils/date';
@Entity('province_geo')
export class ProvinceGeo {
  @PrimaryGeneratedColumn({
    name: 'id',
  })
  id: number;

  @Column({
    type: String, 
    nullable: false, 
    name: 'province_name',
  })
  provinceName: string;
  
  @Column({
    type: String, 
    nullable: false, 
    name: 'province_lat',
  })
  provinceLat: string;

  @Column({
    type: String, 
    nullable: false, 
    name: 'province_lon',
  })
  provinceLon: string;

  @Column({
    nullable: false, 
    name: 'province_zoom',
  })
  provinceZoom: number;

  @Column({
    nullable: false, 
    name: 'province_id',
  })
  provinceId: number;
}
