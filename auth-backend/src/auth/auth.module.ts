import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { SocialAccount } from '../entities/social-account.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailVerificationCode } from 'src/entities/email-verification-code.entity';
import { EmailService } from 'src/services/email.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([User, SocialAccount, RefreshToken, EmailVerificationCode]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy, EmailService],
    exports: [AuthService],
})
export class AuthModule { }