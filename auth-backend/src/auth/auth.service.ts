import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { SocialAccount } from '../entities/social-account.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { EmailVerificationCode } from '../entities/email-verification-code.entity';
import { EmailService } from '../services/email.service';
import {
    RegisterDto,
    LoginDto,
    VerifyEmailDto,
    ResendVerificationDto,
    SocialRegisterDto
} from './dto/auth.dto';

export interface JwtPayload {
    sub: string;
    email: string;
    type: 'access' | 'refresh';
    isEmailVerified?: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(SocialAccount)
        private socialAccountRepository: Repository<SocialAccount>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        @InjectRepository(EmailVerificationCode)
        private emailVerificationCodeRepository: Repository<EmailVerificationCode>,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
        private httpService: HttpService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: User; message: string }> {
        const { email, password, firstName, lastName } = registerDto;

        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = this.userRepository.create({
            email,
            passwordHash,
            firstName,
            lastName,
            isEmailVerified: false,
        });

        const savedUser = await this.userRepository.save(user);

        // Send verification code
        await this.sendVerificationCode(savedUser.id);

        return {
            user: savedUser,
            message: 'Registration successful! Please check your email for verification code.',
        };
    }

    async login(loginDto: LoginDto): Promise<AuthTokens> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: { email, isActive: true },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);

        return this.generateTokens(user);
    }

    async socialLogin(provider: string, profile: any): Promise<AuthTokens> {


        let user = await this.findUserBySocialAccount(provider, profile.id);


        if (!user) {
            // Check if user exists with the same email
            user = await this.userRepository.findOne({
                where: { email: profile.emails?.[0]?.value },
            });

            if (!user) {
                // Create new user from social profile
                user = await this.createUserFromSocialProfile(profile);
            }

            await this.linkSocialAccount(user, provider, profile);
        }

        // Update last login
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);

        return this.generateTokens(user);
    }

    async socialRegister(socialRegisterDto: SocialRegisterDto): Promise<AuthTokens> {
        const { provider, code } = socialRegisterDto;

        // Exchange authorization code for access token and get user profile
        const profile = await this.getSocialProfile(provider, code);

        // Check if account already linked
        const existingSocialAccount = await this.socialAccountRepository.findOne({
            where: { provider, providerId: profile.id },
            relations: ['user'],
        });

        if (existingSocialAccount) {
            throw new ConflictException('This social account is already linked to an account');
        }

        // Check if user exists with same email
        let user = await this.userRepository.findOne({
            where: { email: profile.emails?.[0]?.value },
        });

        if (user) {
            // Link social account to existing user
            await this.linkSocialAccount(user, provider, profile);
        } else {
            // Create new user
            user = await this.createUserFromSocialProfile(profile);
            await this.linkSocialAccount(user, provider, profile);
        }

        user.lastLoginAt = new Date();
        await this.userRepository.save(user);

        return this.generateTokens(user);
    }

    async verifyEmail(userId: string, verifyEmailDto: VerifyEmailDto): Promise<AuthTokens> {
        const { code } = verifyEmailDto;

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        // Find active verification code
        const verificationRecord = await this.emailVerificationCodeRepository.findOne({
            where: {
                userId,
                isUsed: false,
            },
            order: { createdAt: 'DESC' },
        });

        if (!verificationRecord) {
            throw new BadRequestException('No verification code found. Please request a new one.');
        }

        if (verificationRecord.expiresAt < new Date()) {
            throw new BadRequestException('Verification code has expired. Please request a new one.');
        }

        if (verificationRecord.attempts >= verificationRecord.maxAttempts) {
            throw new BadRequestException('Maximum verification attempts exceeded. Please request a new code.');
        }

        // Verify code
        const isCodeValid = await bcrypt.compare(code, verificationRecord.codeHash);

        if (!isCodeValid) {
            // Increment attempts
            verificationRecord.attempts += 1;
            await this.emailVerificationCodeRepository.save(verificationRecord);

            const remainingAttempts = verificationRecord.maxAttempts - verificationRecord.attempts;
            throw new BadRequestException(
                `Invalid verification code. ${remainingAttempts} attempts remaining.`
            );
        }

        // Mark code as used
        verificationRecord.isUsed = true;
        await this.emailVerificationCodeRepository.save(verificationRecord);

        // Verify user email
        user.isEmailVerified = true;
        await this.userRepository.save(user);

        // Send welcome email
        await this.emailService.sendWelcomeEmail(user.email, user.firstName);

        return this.generateTokens(user);
    }

    async resendVerificationCode(resendDto: ResendVerificationDto): Promise<{ message: string }> {
        const { email } = resendDto;

        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        // Check rate limiting (max 3 codes per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentCodes = await this.emailVerificationCodeRepository.count({
            where: {
                userId: user.id,
                createdAt: { $gte: oneHourAgo } as any,
            },
        });

        if (recentCodes >= 3) {
            throw new BadRequestException('Too many verification codes requested. Please try again later.');
        }

        await this.sendVerificationCode(user.id);

        return { message: 'Verification code sent to your email' };
    }

    async refreshTokens(refreshToken: string, deviceInfo?: string): Promise<AuthTokens> {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            const user = await this.userRepository.findOne({
                where: { id: payload.sub, isActive: true },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid token');
            }

            // Verify refresh token exists in database
            const hashedToken = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');

            const storedToken = await this.refreshTokenRepository.findOne({
                where: {
                    tokenHash: hashedToken,
                    userId: user.id,
                    isRevoked: false,
                },
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid or expired token');
            }

            // Revoke old refresh token
            storedToken.isRevoked = true;
            await this.refreshTokenRepository.save(storedToken);

            // Generate new tokens
            return this.generateTokens(user, deviceInfo);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async logout(userId: string, refreshToken?: string): Promise<void> {
        if (refreshToken) {
            const hashedToken = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');

            await this.refreshTokenRepository.update(
                { tokenHash: hashedToken, userId },
                { isRevoked: true },
            );
        } else {
            // Revoke all refresh tokens for user
            await this.refreshTokenRepository.update(
                { userId, isRevoked: false },
                { isRevoked: true },
            );
        }
    }

    async logoutAllDevices(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            { userId, isRevoked: false },
            { isRevoked: true },
        );
    }

    private async sendVerificationCode(userId: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await bcrypt.hash(code, 10);

        // Set expiration to 15 minutes
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Save verification code
        const verificationCode = this.emailVerificationCodeRepository.create({
            userId,
            code,
            codeHash,
            expiresAt,
        });

        await this.emailVerificationCodeRepository.save(verificationCode);

        // Send email
        await this.emailService.sendVerificationCode(
            user.email,
            code,
            user.firstName
        );
    }

    private async getSocialProfile(provider: string, authCode: string): Promise<any> {
        switch (provider) {
            case 'google':
                return this.getGoogleProfile(authCode);
            case 'github':
                return this.getGithubProfile(authCode);
            default:
                throw new BadRequestException('Unsupported social provider');
        }
    }

    private async getGoogleProfile(authCode: string): Promise<any> {
        try {
            // Exchange code for tokens
            const tokenResponse = await firstValueFrom(
                this.httpService.post('https://oauth2.googleapis.com/token', {
                    code: authCode,
                    client_id: this.configService.get('GOOGLE_CLIENT_ID'),
                    client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
                    redirect_uri: this.configService.get('GOOGLE_CALLBACK_URL'),
                    grant_type: 'authorization_code',
                })
            );

            const { access_token } = tokenResponse.data;

            // Get user profile
            const profileResponse = await firstValueFrom(
                this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` },
                })
            );

            return {
                id: profileResponse.data.id,
                emails: [{ value: profileResponse.data.email }],
                name: {
                    givenName: profileResponse.data.given_name,
                    familyName: profileResponse.data.family_name,
                },
                photos: [{ value: profileResponse.data.picture }],
                _json: profileResponse.data,
            };
        } catch (error) {
            throw new BadRequestException('Failed to get Google profile');
        }
    }

    private async getGithubProfile(authCode: string): Promise<any> {
        try {
            // Exchange code for tokens
            const tokenResponse = await firstValueFrom(
                this.httpService.post('https://github.com/login/oauth/access_token', {
                    code: authCode,
                    client_id: this.configService.get('GITHUB_CLIENT_ID'),
                    client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
                }, {
                    headers: { Accept: 'application/json' },
                })
            );

            const { access_token } = tokenResponse.data;

            // Get user profile and email
            const [profileResponse, emailResponse] = await Promise.all([
                firstValueFrom(
                    this.httpService.get('https://api.github.com/user', {
                        headers: { Authorization: `Bearer ${access_token}` },
                    })
                ),
                firstValueFrom(
                    this.httpService.get('https://api.github.com/user/emails', {
                        headers: { Authorization: `Bearer ${access_token}` },
                    })
                ),
            ]);

            const primaryEmail = emailResponse.data.find((email: any) => email.primary);

            return {
                id: profileResponse.data.id.toString(),
                emails: [{ value: primaryEmail.email }],
                name: {
                    givenName: profileResponse.data.name?.split(' ')[0] || '',
                    familyName: profileResponse.data.name?.split(' ').slice(1).join(' ') || '',
                },
                photos: [{ value: profileResponse.data.avatar_url }],
                _json: { ...profileResponse.data, email: primaryEmail.email },
            };
        } catch (error) {
            throw new BadRequestException('Failed to get GitHub profile');
        }
    }

    private async generateTokens(user: User, deviceInfo?: string): Promise<AuthTokens> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            type: 'access',
            isEmailVerified: user.isEmailVerified,
        };

        const refreshPayload: JwtPayload = {
            ...payload,
            type: 'refresh',
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });

        // Store refresh token hash in database
        const hashedToken = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.refreshTokenRepository.save({
            userId: user.id,
            tokenHash: hashedToken,
            expiresAt,
            deviceInfo,
        });

        // Remove sensitive data from user object
        const { passwordHash, ...userWithoutPassword } = user;

        return {
            accessToken,
            refreshToken,
            user: userWithoutPassword
        };
    }

    private async findUserBySocialAccount(
        provider: string,
        providerId: string,
    ): Promise<User | null> {
        const socialAccount = await this.socialAccountRepository.findOne({
            where: { provider, providerId },
            relations: ['user'],
        });

        return socialAccount?.user || null;
    }

    private async createUserFromSocialProfile(profile: any): Promise<User> {
        const user = this.userRepository.create({
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            avatarUrl: profile.photos?.[0]?.value,
            isEmailVerified: true, // Social accounts are pre-verified
        });

        return this.userRepository.save(user);
    }

    private async linkSocialAccount(
        user: User,
        provider: string,
        profile: any,
    ): Promise<void> {
        const socialAccount = this.socialAccountRepository.create({
            userId: user.id,
            provider,
            providerId: profile.id,
            providerEmail: profile.emails?.[0]?.value,
            providerData: profile._raw,
        });

        await this.socialAccountRepository.save(socialAccount);
    }
} 