import { faker } from '@faker-js/faker';
import { entries, keys } from '@household/shared/common/utils';
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

type CompareResult<V = any> = {
  actual: V;
  expected: V;
};

export const createComparer = (factory: (compare: <V>(actual: V, expected: V) => CompareResult<V>) => Record<string, CompareResult<any>>) => {
  const normalized = factory((actual, expected) => {
    return actual === expected ? undefined : {
      actual,
      expected,
    };
  });

  return {
    extraKeys: <T extends object>(object: T, internalProperties: (keyof T)[] = []) => {
      return keys(object).filter(
        (key) => {
          return !(key in normalized) && !internalProperties.includes(key);
        },
      );
    },
    notMatchingProperties: () => {
      return entries(normalized).reduce<string[]>((accumulator, [
        key,
        result,
      ]) => {
        if (!result) {
          return accumulator;
        }
        return [
          ...accumulator,
          `${key} (expected: ${result.expected}, actual: ${result.actual})`,
        ];
      }, []); 
    },
  };
};
