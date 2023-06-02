import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'boards_schedule_time' })
export class BoardsScheduleTime {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    boards_schedule_id: number;

    @Column()
    start_h: number;

    @Column()
    start_m: number;

    @Column()
    end_h: number;

    @Column()
    end_m: number;

    @Column()
    status: string;
}