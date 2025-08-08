import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'token_hash', length: 255 })
    tokenHash: string;

    @Column({ name: 'expires_at', type: 'datetime2' })
    expiresAt: Date;

    @Column({ name: 'is_revoked', default: false })
    isRevoked: boolean;

    @Column({ name: 'device_info', nullable: true, length: 500, type: 'nvarchar' })
    deviceInfo: string;

    @Column({ name: 'ip_address', nullable: true, length: 45, type: 'nvarchar' })
    ipAddress: string;

    @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
