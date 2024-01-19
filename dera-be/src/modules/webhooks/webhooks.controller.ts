import { Body, Controller, Headers, Post } from '@nestjs/common';
import { WebhookApi } from '../../utils/constants';
import { WebhooksService } from './abstract-webhooks.service';

@WebhookApi()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('clerk/orgs-changes')
  async handleClerkOrgsChanges(
    @Headers('svix-id') svixId: string | undefined,
    @Headers('svix-timestamp') svidxTimestamp: string | undefined,
    @Headers('svix-signature') svidxSignature: string | undefined,
    @Body() body: any,
  ) {
    await this.webhooksService.handleClerkOrgsChanges(
      svixId,
      svidxTimestamp,
      svidxSignature,
      body,
    );
  }
}
