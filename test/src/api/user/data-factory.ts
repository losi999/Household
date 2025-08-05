import { DataFactoryFunction } from '@household/shared/types/common';
import { Auth, User } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';

export const userDataFactory = (() => {
  const createUserRequest: DataFactoryFunction<User.Request> = (req) => {
    return {
      email: faker.internet.email(),
      ...req,
    };
  };

  const createConfirmedUser: DataFactoryFunction<User.Request & Auth.Password & User.Group> = (req) => {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
      group: undefined,
      ...req,
    };
  };

  const createPendingUser: DataFactoryFunction<User.Request & Auth.TemporaryPassword> = (req) => {
    return {
      email: faker.internet.email(),
      temporaryPassword: faker.internet.password(),
      ...req,
    };
  };

  const createConfirmRequest: DataFactoryFunction<Auth.ConfirmUser.Request> = (req) => {
    return {
      password: faker.internet.password(),
      temporaryPassword: faker.internet.password(),
      ...req,
    };
  };

  return {
    request: createUserRequest,
    confirmedUser: createConfirmedUser,
    pendindUser: createPendingUser,
    confirmRequest: createConfirmRequest,
  };
})();
