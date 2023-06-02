import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'boards_auto_config' })
export class BoardsAutoConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    device_id: string;

    @Column()
    slot: number;

    @Column()
    sensor_id: number;

    @Column()
    serial: number;

    @Column()
    ap_serial: string;

    @Column()
    start: string;

    @Column()
    finish: string;

    @Column()
    val: number;

    @Column({
        type: 'enum',
        enum: {
            "on": "on",
            "off": "off"
        },
        default: "off"
    })
    status: string;

    @Column({ default: '0' })
    confirm: string;

    @CreateDateColumn()
    created_at: Date;
}