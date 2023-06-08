import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IsNotEmpty, IsString, IsNumber, IsDate, IsInt } from "class-validator";

@Entity('jhi_sensors')
export class Sensors {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 100,
    })
    name:string

    @Column({
        type: "varchar",
        length: 100,
    })
    unit:string

    @Column({
        type: "varchar",
        length: 100,
    })
    type:string

    @Column()
    category_id:number

    @Column({
        type: 'enum',
        enum: {
            "active": "active",
            "inactive": "inactive"
        },
    })
    status:string

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