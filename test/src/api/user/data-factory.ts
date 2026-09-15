import { DataFactoryFunction } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { faker } from '@faker-js/faker';

export const userDataFactory = (() => {
  const createUserRequest: DataFactoryFunction<Requests.User> = (req) => {
    return {
      email: faker.internet.email(),
      ...req,
    };
  };

  const createConfirmedUser: DataFactoryFunction<Requests.User & Api.Auth.Password & Api.User.Group> = (req) => {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
      group: undefined,
      ...req,
    };
  };

  const createPendingUser: DataFactoryFunction<Requests.User & Api.Auth.TemporaryPassword> = (req) => {
    return {
      email: faker.internet.email(),
      temporaryPassword: faker.internet.password(),
      ...req,
    };
  };

  const createConfirmRequest: DataFactoryFunction<Requests.ConfirmUser> = (req) => {
    return {
      password: faker.internet.password(),
      temporaryPassword: faker.internet.password(),
      ...req,
    };
  };

  return {
    request: createUserRequest,
    confirmedUser: createConfirmedUser,
    pendingUser: createPendingUser,
    confirmRequest: createConfirmRequest,
  };
})();
