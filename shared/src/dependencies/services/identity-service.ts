import { cognito } from '@household/shared/dependencies/aws/cognito';
import { identityServiceFactory } from '@household/shared/services/identity-service';

export const identityService = identityServiceFactory(process.env.USER_POOL_ID, process.env.CLIENT_ID, cognito);
