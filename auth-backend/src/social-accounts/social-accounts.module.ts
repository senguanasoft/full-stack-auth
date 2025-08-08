import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccount } from './entities/social-account.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([SocialAccount]), UsersModule],
    providers: [SocialAccountsService],
    exports: [SocialAccountsService],
})
export class SocialAccountsModule { }