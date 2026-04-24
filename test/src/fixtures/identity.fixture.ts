import { IIdentityService } from '@household/shared/services/identity-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';
import { identityService } from '@household/shared/dependencies/services/identity-service';

export const test = baseTest.extend<Pick<IIdentityService, 'deleteUser' | 'createUser' | 'listGroupsByUser' | 'getUser'>>({
  deleteUser: async ({ logServiceCall }, use) => {
    const deleteUser: IIdentityService['deleteUser'] = async (ctx) => {
      const result = await identityService.deleteUser(ctx);
      await logServiceCall('deleteUser', ctx, result);
      return result;
    };

    await use(deleteUser);
  },
  createUser: async ({ logServiceCall }, use) => {
    const createUser: IIdentityService['createUser'] = async (body, userType, supressEmail) => {
      const result = await identityService.createUser(body, userType, supressEmail);
      await logServiceCall('createUser', {
        body,
        userType,
        supressEmail, 
      }, result);
      return result;
    };

    await use(createUser);
  },
  listGroupsByUser: async ({ logServiceCall }, use) => {
    const listGroupsByUser: IIdentityService['listGroupsByUser'] = async (email) => {
      const result = await identityService.listGroupsByUser(email);
      await logServiceCall('listGroupsByUser', {
        email,
      }, result);
      return result;
    };

    await use(listGroupsByUser);  
  },
  getUser: async ({ logServiceCall }, use) => {
    const getUser: IIdentityService['getUser'] = async (ctx) => {
      const result = await identityService.getUser(ctx);
      await logServiceCall('getUser', ctx, result);
      return result;
    };

    await use(getUser);
  },
});
