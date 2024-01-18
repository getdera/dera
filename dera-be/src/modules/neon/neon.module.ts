import { Module } from '@nestjs/common';
import { NeonService } from './neon.service';
import { ConfigService } from '@nestjs/config';
import { NeonServiceConfig } from './types';

@Module({
  providers: [
    {
      provide: 'NEON_SERVICE_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): NeonServiceConfig => {
        return {
          neonApiKey: configService.getOrThrow<string>('NEON_API_KEY'),
        };
      },
    },
    NeonService,
  ],
  exports: [NeonService],
})
export class NeonModule {}
