import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { User } from '@household/shared/types/types';

export interface ICreateUserService {
  (ctx: {
    body: User.Request;
    suppressEmail: boolean;
  }): Promise<unknown>;
}

export const createUserServiceFactory = (identityService: IIdentityService): ICreateUserService => {
  return ({ body, suppressEmail }) => {
    return identityService.createUser(body, undefined, suppressEmail).catch(httpErrors.cognito.createUser(body));
  };
};
