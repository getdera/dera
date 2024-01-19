import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { SdkTokensService } from './sdk-tokens.service';
import { Request } from 'express';
import { EmbeddingSchemasService } from '../embedding-schemas/embedding-schemas.service';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

const SDK_API_TOKEN_KEY_HEADER = 'x-dera-token-key';
const SDK_API_TOKEN_SECRET_HEADER = 'x-dera-token-secret';

export type SdkApiAuthedRequest = Request & {
  apiCaller: {
    org: {
      id: string;
    };
  };
};

/**
 * Check caller is authenticated and is authorized to access the embedding schema. Must be used on URLs that have an embeddingSchemaId path param.
 */
@Injectable()
export class SdkApiAuthGuard extends ThrottlerGuard {
  constructor(
    protected options: ThrottlerModuleOptions,
    protected storage: ThrottlerStorage,
    protected reflector: Reflector,
    private readonly sdkTokensService: SdkTokensService,
    private readonly embeddingSchemasService: EmbeddingSchemasService,
  ) {
    super(options, storage, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authTokenKey: string | undefined =
      request.headers[SDK_API_TOKEN_KEY_HEADER]?.trim();
    if (!authTokenKey) {
      return false;
    }

    if (!uuidValidate(authTokenKey)) {
      return false;
    }

    const authTokenSecret: string | undefined =
      request.headers[SDK_API_TOKEN_SECRET_HEADER]?.trim();
    if (!authTokenSecret) {
      return false;
    }

    const orgDetails = await this.sdkTokensService.compareSdkToken(
      authTokenKey,
      authTokenSecret,
    );
    if (!orgDetails) {
      return false;
    }

    // our throttler guard and the remaining checks below expects this
    request.apiCaller = {
      org: {
        id: orgDetails.orgId,
      },
    };

    // an exception will be thrown if the request is throttled and the execution will stop here
    await super.canActivate(context);

    return await this.hasAccessToEmbeddingSchema(
      request,
      request.apiCaller.org.id,
    );
  }

  private async hasAccessToEmbeddingSchema(
    request: any,
    orgId: string,
  ): Promise<boolean> {
    const embeddingSchemaId = request.params.embeddingSchemaId;
    if (!embeddingSchemaId) {
      throw new UnauthorizedException('Missing embeddingSchemaId provided');
    }
    if (!uuidValidate(embeddingSchemaId)) {
      throw new BadRequestException('Invalid embeddingSchemaId provided');
    }

    const embeddingSchema =
      await this.embeddingSchemasService.getEmbeddingSchemaWithFields(
        orgId,
        embeddingSchemaId,
        true,
      );

    return !!embeddingSchema;
  }
}
