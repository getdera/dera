import { Module } from '@nestjs/common';
import { BearerAuthGuard } from './bearer-auth.guard';
import { BearerStrategy } from './bearer.strategy';
import { ConfigService } from '@nestjs/config';
import { BearerStrategyConfig } from './types';

@Module({
  providers: [
    {
      provide: 'BEARER_STRATEGY_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): BearerStrategyConfig => {
        return {
          authorizedParties: configService
            .getOrThrow<string>('CLERK_AUTHORIZED_PARTIES')
            .split(','),
          issuer: configService.getOrThrow<string>('CLERK_ISSUER_URL'),
        };
      },
    },
    BearerAuthGuard,
    BearerStrategy,
  ],
  exports: [BearerAuthGuard, BearerStrategy],
})
export class AuthModule {}
