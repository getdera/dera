import { SetMetadata } from '@nestjs/common';

export const IS_SDK_API = 'IS_SDK_API';
export const SdkApi = () => SetMetadata(IS_SDK_API, true);

export const IS_WEBHOOK = 'IS_WEBHOOK';
export const WebhookApi = () => SetMetadata(IS_WEBHOOK, true);

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
