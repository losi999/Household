import { UserType } from '@household/shared/enums';
import { IIdentityService } from '@household/shared/services/identity-service';

export interface ICreateTestUsersService {
  (): Promise<unknown>;
}

export const createTestUsersServiceFactory = (identityService: IIdentityService): ICreateTestUsersService => {
  const createUser = async (userType?: UserType) => {
    const email = `losonczil+${userType ?? 'viewer'}@gmail.com`;
    try {
      await identityService.createUser({
        email,
        password: process.env.TEST_USER_PASSWORD,
      }, userType);
    } catch (error) {
      if (error.name !== 'UsernameExistsException') {
        throw error;
      }
    }
  };
  return () => {
    return Promise.all([
      ...Object.values(UserType).map(x => createUser(x)),
      createUser(),
    ]);
  };
};
