// Objeto de transferencia de datos para el inicio de sesión.

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
