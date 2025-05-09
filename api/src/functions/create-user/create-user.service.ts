import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { User } from '@household/shared/types/types';

export interface ICreateUserService {
  (ctx: {
    body: User.Request;
    suppressEmail: boolean;
  }): Promise<void>;
}

export const createUserServiceFactory = (identityService: IIdentityService): ICreateUserService => {
  return async ({ body, suppressEmail }) => {
    await identityService.createUser(body, suppressEmail).catch(httpErrors.cognito.createUser(body));
  };
};
