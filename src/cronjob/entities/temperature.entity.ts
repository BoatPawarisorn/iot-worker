import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { currentDateTime } from 'src/utils/date';
@Entity('temperature_hourly')
export class Temperature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false, 
    name: 'province_id',
  })
  provinceId: number;
  
  @Column({
    type: String, 
    nullable: false, 
    name: 'temperature',
  })
  temperature: string;

  @CreateDateColumn({
    type: 'datetime', 
    nullable: true, 
    name: 'created_at',
  })
  createdAt: Date;

  @BeforeInsert()
  createDates() {
      this.createdAt = currentDateTime()
  }
}
