import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SdkTokenEntity } from './sdk-token.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const TOKEN_PREFIX = 'dera_';

@Injectable()
export class SdkTokensService {
  constructor(
    @InjectRepository(SdkTokenEntity)
    private readonly sdkTokenRepository: Repository<SdkTokenEntity>,
  ) {}

  async createSdkToken(
    orgId: string,
    creatorId: string,
    name: string,
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    creatorId: string;
    name: string;
    originalTokenValue: string;
  }> {
    const originalTokenValue = `${TOKEN_PREFIX}${Buffer.from(uuidv4()).toString(
      'base64',
    )}`;
    const hashedToken = bcrypt.hash(originalTokenValue, 12);
    let sdkTokenEntity = new SdkTokenEntity();
    sdkTokenEntity.orgId = orgId;
    sdkTokenEntity.creatorId = creatorId;
    sdkTokenEntity.hashedToken = await hashedToken;
    sdkTokenEntity.name = name;
    sdkTokenEntity = await this.sdkTokenRepository.save(sdkTokenEntity);
    return {
      id: sdkTokenEntity.id,
      createdAt: sdkTokenEntity.createdAt,
      updatedAt: sdkTokenEntity.updatedAt,
      creatorId: sdkTokenEntity.creatorId,
      name: sdkTokenEntity.name,
      originalTokenValue,
    };
  }

  async getSdkTokens(orgId: string): Promise<
    {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      creatorId: string;
      name: string;
    }[]
  > {
    const sdkTokens = await this.sdkTokenRepository.find({
      where: {
        orgId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return sdkTokens.map((sdkToken) => ({
      id: sdkToken.id,
      createdAt: sdkToken.createdAt,
      updatedAt: sdkToken.updatedAt,
      creatorId: sdkToken.creatorId,
      name: sdkToken.name,
    }));
  }

  async deleteSdkToken(orgId: string, id: string): Promise<void> {
    await this.sdkTokenRepository.delete({
      orgId,
      id,
    });
  }

  /**
   * @returns orgId if the token is valid, null otherwise
   */
  async compareSdkToken(
    tokenKey: string,
    tokenSecret: string,
  ): Promise<{
    orgId: string;
  } | null> {
    const tokenEntity = await this.sdkTokenRepository.findOne({
      where: {
        id: tokenKey,
      },
    });

    if (!tokenEntity) {
      return null;
    }

    const matched = await bcrypt.compare(tokenSecret, tokenEntity.hashedToken);
    if (!matched) {
      return null;
    }

    return {
      orgId: tokenEntity.orgId,
    };
  }
}
