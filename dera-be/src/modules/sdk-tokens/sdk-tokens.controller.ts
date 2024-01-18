import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SdkTokensService } from './sdk-tokens.service';
import { OrgMembershipGuard } from '../auth/org-membership.guard';
import { AuthedRequest } from '../auth/types';
import {
  CreateSdkTokenReq,
  CreateSdkTokenResp,
  ListSdkTokensResp,
} from './types';

@UseGuards(OrgMembershipGuard)
@Controller('orgs/:orgId/sdk-tokens')
export class SdkTokensController {
  constructor(private readonly sdkTokensService: SdkTokensService) {}

  @Post()
  async createSdkToken(
    @Param('orgId') orgId: string,
    @Request() req: AuthedRequest,
    @Body() createSdkTokenReq: CreateSdkTokenReq,
  ): Promise<CreateSdkTokenResp> {
    const tokenCreated = await this.sdkTokensService.createSdkToken(
      orgId,
      req.user.id,
      createSdkTokenReq.name,
    );

    return {
      id: tokenCreated.id,
      createdAt: tokenCreated.createdAt,
      updatedAt: tokenCreated.updatedAt,
      creatorId: tokenCreated.creatorId,
      name: tokenCreated.name,
      originalTokenValue: tokenCreated.originalTokenValue,
    };
  }

  @Get()
  async getSdkTokens(
    @Param('orgId') orgId: string,
  ): Promise<ListSdkTokensResp> {
    const tokens = await this.sdkTokensService.getSdkTokens(orgId);
    return {
      tokens: tokens.map((token) => ({
        id: token.id,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
        creatorId: token.creatorId,
        name: token.name,
      })),
    };
  }

  @Delete(':tokenId')
  async deleteSdkToken(
    @Param('orgId') orgId: string,
    @Param('tokenId', ParseUUIDPipe) tokenId: string,
  ): Promise<{
    message: string;
  }> {
    await this.sdkTokensService.deleteSdkToken(orgId, tokenId);
    return {
      message: 'ok',
    };
  }
}
