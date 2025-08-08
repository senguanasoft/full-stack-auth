import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Req,
    Res,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
    RegisterDto,
    LoginDto,
    VerifyEmailDto,
    ResendVerificationDto,
    SocialRegisterDto
} from './dto/auth.dto';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
    ) {
        const deviceInfo = request.get('User-Agent');
        const tokens = await this.authService.login(loginDto);

        // Set refresh token in httpOnly cookie
        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
            accessToken: tokens.accessToken,
            user: tokens.user
        };
    }

    @Post('verify-email')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
    async verifyEmail(
        @Req() request: Request & { user: User },
        @Body() verifyEmailDto: VerifyEmailDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const tokens = await this.authService.verifyEmail(request.user.id, verifyEmailDto);

        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken: tokens.accessToken,
            user: tokens.user,
            message: 'Email verified successfully!'
        };
    }

    @Post('resend-verification')
    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
    async resendVerification(@Body() resendDto: ResendVerificationDto) {
        return this.authService.resendVerificationCode(resendDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Initiates Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(
        @Req() req: Request,
        @Res() response: Response,
    ) {
        const tokens = await this.authService.socialLogin('google', req.user);

        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Redirect to frontend with access token
        response.redirect(
            `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`,
        );
    }

    @Post('social/register')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async socialRegister(
        @Body() socialRegisterDto: SocialRegisterDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const tokens = await this.authService.socialRegister(socialRegisterDto);

        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken: tokens.accessToken,
            user: tokens.user
        };
    }

    @Post('refresh')
    async refreshTokens(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies.refreshToken;
        const deviceInfo = request.get('User-Agent');
        const tokens = await this.authService.refreshTokens(refreshToken, deviceInfo);

        response.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken: tokens.accessToken,
            user: tokens.user
        };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(
        @Req() request: Request & { user: User },
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies.refreshToken;
        await this.authService.logout(request.user.id, refreshToken);

        response.clearCookie('refreshToken');
        return { message: 'Logged out successfully' };
    }

    @Post('logout-all')
    @UseGuards(AuthGuard('jwt'))
    async logoutAllDevices(
        @Req() request: Request & { user: User },
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.logoutAllDevices(request.user.id);

        response.clearCookie('refreshToken');
        return { message: 'Logged out from all devices successfully' };
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Req() request: Request & { user: User }) {
        return request.user;
    }
}