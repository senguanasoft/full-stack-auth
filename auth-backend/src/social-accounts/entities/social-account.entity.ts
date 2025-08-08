// Nueva entidad para mapear a la tabla `social_accounts`.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('social_accounts')
export class SocialAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    provider: string;

    @Column({ unique: true })
    provider_user_id: string;

    @Column({ nullable: true })
    access_token: string;

    @Column({ nullable: true })
    refresh_token: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @ManyToOne(() => User, (user) => user.socialAccounts)
    @JoinColumn({ name: 'user_id' })
    user: User;
}