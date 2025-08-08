// Objeto de transferencia de datos para el registro de usuarios.

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}