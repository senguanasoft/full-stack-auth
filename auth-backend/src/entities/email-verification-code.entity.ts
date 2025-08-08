import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('email_verification_codes')
export class EmailVerificationCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ length: 6, type: 'nvarchar' })
    code: string;

    @Column({ name: 'code_hash', length: 255, type: 'nvarchar' })
    codeHash: string;

    @Column({ name: 'expires_at', type: 'datetime2' })
    expiresAt: Date;

    @Column({ default: 0, type: 'int' })
    attempts: number;

    @Column({ name: 'max_attempts', default: 5, type: 'int' })
    maxAttempts: number;

    @Column({ name: 'is_used', default: false, type: 'bit' })
    isUsed: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.emailVerificationCodes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
