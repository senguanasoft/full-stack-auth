import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SocialAccount } from './social-account.entity';
import { RefreshToken } from './refresh-token.entity';
import { EmailVerificationCode } from './email-verification-code.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', nullable: true, type: 'datetime2' })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime2' })  // fix typo from updated_At to updated_at
  updatedAt: Date;

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => EmailVerificationCode, (code) => code.user)
  emailVerificationCodes: EmailVerificationCode[];
}
