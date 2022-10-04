import { IIdentityService } from '@household/shared/services/identity-service';

export interface ICreateTestUsersService {
  (ctx: {
    numberOfAdmins: number;
  }): Promise<void>;
}

export const createTestUsersServiceFactory = (identityService: IIdentityService): ICreateTestUsersService => {
  const createUser = async (index: number) => {
    const email = `losonczil+${index}@gmail.com`;
    try {
      await identityService.register({
        email,
        password: process.env.TEST_USER_PASSWORD,
        displayName: `test${index}`,
      });
    } catch (error) {
      if (error.code !== 'UsernameExistsException') {
        throw error;
      }
    }
  };
  return async ({ numberOfAdmins }) => {
    await Promise.all([...[...Array(numberOfAdmins).keys()].map(x => createUser(x + 1))]);
  };
};
