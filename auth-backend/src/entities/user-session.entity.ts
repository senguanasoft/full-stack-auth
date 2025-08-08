// Entidad que mapea a la tabla `user_sessions`.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ unique: true })
    session_token: string;

    @Column({ nullable: true })
    ip_address: string;

    @Column({ nullable: true })
    user_agent: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @Column({ type: 'datetime' })
    expires_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}