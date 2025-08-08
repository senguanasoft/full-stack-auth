import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}

export class VerifyEmailDto {
    @IsString()
    @MinLength(6, { message: 'Verification code must be 6 digits' })
    code: string;
}

export class ResendVerificationDto {
    @IsEmail()
    email: string;
}

export class SocialRegisterDto {
    @IsString()
    provider: string;

    @IsString()
    code: string; // OAuth authorization code

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;
}