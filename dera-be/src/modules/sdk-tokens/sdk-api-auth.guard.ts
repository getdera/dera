import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { SdkTokensService } from './sdk-tokens.service';
import { Request } from 'express';
import { EmbeddingSchemasService } from '../embedding-schemas/embedding-schemas.service';

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
export class SdkApiAuthGuard implements CanActivate {
  constructor(
    private readonly sdkTokensService: SdkTokensService,
    private readonly embeddingSchemasService: EmbeddingSchemasService,
  ) {}

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

    if (!(await this.hasAccessToEmbeddingSchema(request, orgDetails.orgId))) {
      return false;
    } else {
      request.apiCaller = {
        org: {
          id: orgDetails.orgId,
        },
      };

      return true;
    }
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
