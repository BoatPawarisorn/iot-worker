import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'boards_schedule' })
export class BoardsSchedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    device_id: string;

    @Column()
    slot: number;

    @Column()
    serial: number;

    @Column()
    day1: number;

    @Column()
    day2: number;

    @Column()
    day3: number;

    @Column()
    day4: number;

    @Column()
    day5: number;

    @Column()
    day6: number;

    @Column()
    day7: number;

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

    @UpdateDateColumn()
    updated_at: Date;
}