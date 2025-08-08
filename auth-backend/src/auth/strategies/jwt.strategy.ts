import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        if (payload.type !== 'access') {
            throw new UnauthorizedException();
        }

        const user = await this.userRepository.findOne({
            where: { id: payload.sub, isActive: true },
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}