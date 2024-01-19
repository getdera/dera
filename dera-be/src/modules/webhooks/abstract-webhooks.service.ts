import { Injectable } from '@nestjs/common';

export type WebhooksConfig = {
  clerkOrgsWebhookSigningSecret: string | null;
};

@Injectable()
export abstract class WebhooksService {
  abstract handleClerkOrgsChanges(
    svixId: string | undefined,
    svidxTimestamp: string | undefined,
    svidxSignature: string | undefined,
    body: any,
  ): Promise<void>;
}
