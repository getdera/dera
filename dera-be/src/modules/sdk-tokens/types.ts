import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSdkTokenReq {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class SdkTokenResp {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  name: string;
}

export class ListSdkTokensResp {
  tokens: SdkTokenResp[];
}

/**
 * Only used when creating a new SDK token. We return the original token value once and never store it.
 */
export class CreateSdkTokenResp extends SdkTokenResp {
  originalTokenValue: string;
}
