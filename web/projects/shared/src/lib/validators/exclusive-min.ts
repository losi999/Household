import { SchemaPath, validate } from '@angular/forms/signals';

export const exclusiveMin = (field: SchemaPath<number>, minValue: number, config?: {message: string}) => {
  validate(field, (ctx) => {
    const value = ctx.value();

    if (value === undefined || value === null) {
      return null;
    }

    if (value > minValue) {
      return null;
    }

    return {
      kind: 'exclusiveMin',
      message: config?.message || `The value must be greater than ${minValue}`,
    };
  });
};
