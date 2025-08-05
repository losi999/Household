import { faker } from '@faker-js/faker';
import { User, UserPermissionMap } from '@household/test/api/types';

export const isLocalhost = () => {
  return Cypress.env('ENV') === 'localhost';
};

export const createId = <I>(id?: string): I => (id ?? faker.database.mongodbObjectId()) as I;

export const expectRemainingProperties = (internal: object) => {
  Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf([
    '_id',
    'createdAt',
    'expiresAt',
    'updatedAt',
  ]));
};

export const expectEmptyObject = (obj: object, message?: string) => {
  expect(obj, message).to.deep.equal({});
};

export const forbidUsers = (...users: User[]): UserPermissionMap => {
  return {
    editor: true,
    hairdresser: true,
    viewer: true,
    ...users.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue]: false,
      };
    }, {}),
  };
};

export const allowUsers = (...users: User[]): UserPermissionMap => {
  return {
    editor: false,
    hairdresser: false,
    viewer: false,
    ...users.reduce((accumulator, currentValue) => {
      return {
        ...accumulator,
        [currentValue]: true,
      };
    }, {}),
  };
};
