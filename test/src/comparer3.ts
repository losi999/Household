import { entries } from '@household/shared/common/utils';
import { Branding } from '@household/shared/types/common';
import { Internal } from '@household/shared/types/types';

type Expected<T> = {
  [P in keyof T]?: 
  T[P] extends Internal.Id[] ? Branding<string, any>[] :
    T[P] extends any[] ? Comparer[] :
      T[P] extends Branding<string, infer U> ? Branding<string, U> :
        T[P] extends Internal.Id ? Branding<string, any> : 
          T[P] extends object ? Comparer 
            : T[P];
};

type Comparer = {
  validate(prefix?: string): string[];
};

const isComparer = (value: any): value is Comparer => {
  return typeof value?.validate === 'function';
};

export const createComparer = <D extends object>(actual: D, expected: Expected<D>, ...internalProperties: (keyof D)[]): Comparer => {
  return {
    validate(prefix: string = '') {
      console.log('VALIDATING', prefix, actual);

      const errors = entries(actual).reduce<string[]>((accumulator, [
        prop,
        value,
      ]) => {
        if (internalProperties.includes(prop)) {
          return accumulator;
        }

        const expectedValue = expected[prop];
        const key = `${prefix}${String(prop)}`;

        if (Array.isArray(value) && Array.isArray(expectedValue)) {
          return [
            ...accumulator,
            ...value.flatMap((actualItem, index) => {
              const expectedItem = expectedValue[index];

              if (isComparer(expectedItem)) {
                return expectedItem.validate(`${key}[${index}].`);
              }

              if (actualItem.toString() === expectedItem.toString()) {
                return [];
              }

              return [`${key}[${index}]\n\texpected: ${expectedItem}\n\tactual: ${actualItem}`];
            }),
          ];
        }

        if (isComparer(expectedValue)) {
          return [
            ...accumulator,
            ...expectedValue.validate(`${key}.`),
          ];
        } 

        if (value.toString() === expectedValue.toString()) {
          return accumulator;
        }

        return [
          ...accumulator,
          `${key}\n\texpected: ${expectedValue}\n\tactual: ${value}`,
        ];        
      }, []);

      return errors;
    },
  };
};
