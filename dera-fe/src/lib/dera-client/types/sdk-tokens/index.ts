import { Type } from 'class-transformer';

export class SdkTokenResp {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;

  creatorId: string;
  name: string;
}

export class ListSdkTokensResp {
  @Type(() => SdkTokenResp)
  tokens: SdkTokenResp[];
}

export class CreateSdkTokenReq {
  name: string;
}

/**
 * Only used when creating a new SDK token. We return the original token value once and never store it.
 */
export class CreateSdkTokenResp extends SdkTokenResp {
  originalTokenValue: string;
}
