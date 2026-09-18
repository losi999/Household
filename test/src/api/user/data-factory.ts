import { DataFactoryFunction } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { faker } from '@faker-js/faker';
import { testDataFactory } from '@household/shared/common/test-data-factory';

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

export const userDataFactory = {
  request: testDataFactory.user.request.user,
  confirmedUser: createConfirmedUser,
  pendingUser: createPendingUser,
  confirmRequest: testDataFactory.user.request.confirmUser,
};
