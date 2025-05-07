import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { User } from '@household/shared/types/types';

export interface ICreateUserService {
  (ctx: {body: User.Request}): Promise<void>;
}

export const createUserServiceFactory = (identityService: IIdentityService): ICreateUserService => {
  return async ({ body }) => {
    await identityService.createUser(body).catch(httpErrors.common.genericError('Create user', body));
  };
};
