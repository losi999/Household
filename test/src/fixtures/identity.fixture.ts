import { IIdentityService } from '@household/shared/services/identity-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';
import { identityService } from '@household/shared/dependencies/services/identity-service';

export const test = baseTest.extend<Pick<IIdentityService, 'deleteUser' | 'createUser' | 'listGroupsByUser' | 'getUser'>>({
  deleteUser: async ({ logDbCall }, use) => {
    const deleteUser: IIdentityService['deleteUser'] = async (ctx) => {
      const result = await identityService.deleteUser(ctx);
      await logDbCall('deleteUser', ctx, result);
      return result;
    };

    await use(deleteUser);
  },
  createUser: async ({ logDbCall }, use) => {
    const createUser: IIdentityService['createUser'] = async (body, userType, supressEmail) => {
      const result = await identityService.createUser(body, userType, supressEmail);
      await logDbCall('createUser', {
        body,
        userType,
        supressEmail, 
      }, result);
      return result;
    };

    await use(createUser);
  },
  listGroupsByUser: async ({ logDbCall }, use) => {
    const listGroupsByUser: IIdentityService['listGroupsByUser'] = async (email) => {
      const result = await identityService.listGroupsByUser(email);
      await logDbCall('listGroupsByUser', {
        email,
      }, result);
      return result;
    };

    await use(listGroupsByUser);  
  },
  getUser: async ({ logDbCall }, use) => {
    const getUser: IIdentityService['getUser'] = async (ctx) => {
      const result = await identityService.getUser(ctx);
      await logDbCall('getUser', ctx, result);
      return result;
    };

    await use(getUser);
  },
});
