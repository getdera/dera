import { Module } from '@nestjs/common';
import { EmbeddingSchemasService } from './embedding-schemas.service';
import { EmbeddingSchemasController } from './embedding-schemas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingSchemaEntity } from './embedding-schema.entity';
import { EmbeddingSchemaFieldEntity } from './embedding-schema-field.entity';
import { ProjectsModule } from '../projects/projects.module';
import { NeonModule } from '../neon/neon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmbeddingSchemaEntity,
      EmbeddingSchemaFieldEntity,
    ]),
    ProjectsModule,
    NeonModule,
  ],
  providers: [EmbeddingSchemasService],
  controllers: [EmbeddingSchemasController],
  exports: [EmbeddingSchemasService],
})
export class EmbeddingSchemasModule {}
