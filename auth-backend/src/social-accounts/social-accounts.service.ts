// Nuevo servicio para la lógica de cuentas sociales.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccount } from './entities/social-account.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SocialAccountsService {
    constructor(
        @InjectRepository(SocialAccount)
        private socialAccountsRepository: Repository<SocialAccount>,
        private usersService: UsersService,
    ) { }

    async findOrCreate(provider: string, providerUserId: string, email: string, username: string): Promise<User> {
        const socialAccount = await this.socialAccountsRepository.findOne({
            where: { provider, provider_user_id: providerUserId },
        });

        if (socialAccount) {
            const user = await this.usersService.findOneById(socialAccount.user_id);
            if (user) {
                return user;
            }
            throw new NotFoundException(`User with ID ${socialAccount.user_id} not found.`);
        }

        const user = await this.usersService.create({
            email,
            username,
            status: 'active',
            is_email_verified: true,
        });

        const newSocialAccount = this.socialAccountsRepository.create({
            user_id: user.id,
            provider,
            provider_user_id: providerUserId,
        });
        await this.socialAccountsRepository.save(newSocialAccount);

        return user;
    }
}