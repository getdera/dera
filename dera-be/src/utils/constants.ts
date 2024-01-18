import { SetMetadata } from '@nestjs/common';

export const IS_SDK_API = 'IS_SDK_API';
export const SdkApi = () => SetMetadata(IS_SDK_API, true);
