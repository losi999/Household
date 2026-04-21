import { faker } from '@faker-js/faker';
import { User, UserPermissionMap } from '@household/test/types';

export const createId = <I>(id?: string): I => (id ?? faker.database.mongodbObjectId()) as I;

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
