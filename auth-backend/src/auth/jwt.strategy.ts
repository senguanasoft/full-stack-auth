// Estrategia de Passport para validar tokens JWT.

import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'jwt-recuerdo-uno', // Usa la misma clave que en `auth.module.ts`
        });
    }

    async validate(payload: { sub: number; email: string }): Promise<User> {
        const user = await this.usersService.findOneById(payload.sub);
        if (!user) {
            throw new NotFoundException(`User with sub ${payload.sub} not found.`);

        }
        return user
    }
}