// Entidad que mapea a la tabla `users`.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SocialAccount } from '../../social-accounts/entities/social-account.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password_hash: string;

    @Column({ default: false })
    is_email_verified: boolean;

    @Column({ type: 'datetime', nullable: true })
    last_login_at: Date;

    @Column({ default: 0 })
    failed_login_attempts: number;

    @Column({ type: 'datetime', nullable: true })
    last_failed_login_at: Date;

    @Column({ default: 'active' })
    status: string;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updated_at: Date;

    @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
    socialAccounts: SocialAccount[];
}