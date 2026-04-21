import { entries, getId } from '@household/shared/common/utils';
import { Branding } from '@household/shared/types/common';
import { Internal } from '@household/shared/types/types';

type Expected<T> = {
  [P in keyof T]?: 
  T[P] extends Internal.Id[] ? (Branding<string, any> | Comparer<T[P][number]>)[] :
    T[P] extends object[] ? Comparer<T[P][number]>[] :
      T[P] extends (infer U)[] ? U[] :
        T[P] extends Branding<string, infer U> ? Branding<string, U> :
          T[P] extends Internal.Id ? Branding<string, any> : 
            T[P] extends Date ? string :
              T[P] extends object ? Comparer<T[P]> :
                T[P];
};

const isComparer = (value: any): value is Comparer<any> => {
  return value?.validate instanceof Function;
};

export class Comparer<D extends object> {
  private actual: D;
  private expected: Expected<D>;
  private internalProperties: (keyof D)[];

  constructor(actual: D, expected: Expected<D> | (Expected<D> | Comparer<D>)[], ...internalProperties: (keyof D)[]) {
    this.actual = actual;
    this.internalProperties = internalProperties;
    
    if (Array.isArray(expected)) {
      this.expected = expected.reduce<Expected<D>>((accumulator, item) => {
        if (item instanceof Comparer) {
          return {
            ...accumulator,
            ...item.expected,
          };
        }

        return {
          ...accumulator,
          ...item,
        };
      }, {});
    } else {
      this.expected = expected;
    }
  }

  validate(prefix: string = ''): string[] {
    const errors = entries(this.actual).reduce<string[]>((accumulator, [
      prop,
      value,
    ]) => {
      if (this.internalProperties.includes(prop)) {
        return accumulator;
      }

      const expectedValue = this.expected[prop];
      const key = `${prefix}${String(prop)}`;

      if (Array.isArray(value) && Array.isArray(expectedValue)) {
        return [
          ...accumulator,
          ...value.flatMap((act, index) => {
            const expectedItem = expectedValue[index];

            if (isComparer(expectedItem)) {
              return expectedItem.validate(`${key}[${index}].`);
            }

            let actualItem: any = act;
            if (act instanceof Object) {
              actualItem = getId(act);
            }

            if (actualItem === expectedItem) {
              return [];
            }

            return `${key}[${index}]\n\texpected: ${expectedItem}\n\tactual: ${act}`;
          }),
        ];
      }

      if (isComparer(expectedValue)) {
        return [
          ...accumulator,
          ...expectedValue.validate(`${key}.`),
        ];
      }

      let actualValue: any = value; 

      if (value instanceof Date) {
        actualValue = value.toISOString();
      } else if (value instanceof Object) {
        actualValue = getId(value as any);
      }

      if (actualValue === expectedValue) {
        return accumulator;
      }

      return [
        ...accumulator,
        `${key}\n\texpected: ${expectedValue}\n\tactual: ${actualValue}`,
      ];        
    }, []);

    return errors;
  }
}

