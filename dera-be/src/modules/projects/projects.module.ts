import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { NeonModule } from '../neon/neon.module';
import { ConfigService } from '@nestjs/config';
import { boolean } from 'boolean';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity]), NeonModule],
  providers: [
    ProjectsService,
    {
      provide: 'DERA_SHOW_NEON_IDS_IN_API',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): boolean =>
        boolean(configService.get<string>('DERA_SHOW_NEON_IDS_IN_API')),
    },
  ],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
