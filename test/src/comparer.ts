import { entries, keys } from '@household/shared/common/utils';

type CompareResult<V = any> = {
  actual: V;
  expected: V;
};

type CompareFn = <V>(actual: V, expected: V) => CompareResult<V>;

export const createComparer2 = <D extends object>(ctx: {
  actual: D;
  internalProperties?: (keyof D)[];
  factory: (actual: D, compare: CompareFn) => Record<string, CompareResult<any>>
}) => {
  const normalized = ctx.factory(ctx.actual, (actual, expected) => {
    return actual === expected ? undefined : {
      actual,
      expected,
    };
  });

  const validate = () => {
    const extraKeys = keys(ctx.actual).filter((key) => {
      return !ctx.internalProperties?.includes(key) && !(key in normalized);
    });

    if (extraKeys.length > 0) {
      throw `expected object to not have additional properties, but it has additional properties ${extraKeys.join(', ')}`;
    }

    const notMatchingProperties = entries(normalized).reduce<string[]>((accumulator, [
      key,
      result,
    ]) => {
      if (!result) {
        return accumulator;
      }
      return [
        ...accumulator,
        `${key}\n\texpected: ${result.expected}\n\tactual: ${result.actual}`,
      ];
    }, []);

    if (notMatchingProperties.length > 0) {
      throw `expected objects to match, but the following properties did not match:\n${notMatchingProperties.join('\n')}`;
    }
  }; 

  return {
    getNormalized(prefix?: string) {
      try {
        validate();
        
      } catch (error) {
        console.log(error);
      }

      return prefix ? entries(normalized).reduce((accumulator, [
        key,
        value,
      ]) => {
        return {
          ...accumulator,
          [`${prefix}${key}`]: value,
        };
      }, {}) : normalized;
    },
    validate,
  };
};
