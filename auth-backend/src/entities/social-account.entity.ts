import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('social_accounts')
@Unique(['provider', 'providerId'])
export class SocialAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ length: 50 })
    provider: string;

    @Column({ name: 'provider_id', length: 255 })
    providerId: string;

    @Column({ name: 'provider_email', nullable: true, length: 255 })
    providerEmail: string;

    @Column({ name: 'provider_data', type: 'nvarchar', nullable: true, length: 'MAX' })
    providerData: string; // guarda JSON como string, por eso string y no any

    @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
