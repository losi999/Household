import { ObjectSchema } from '@household/shared/types/schema';
import { validatorService } from '@household/shared/dependencies/services/validator-service';

type Overrides<T> = {
  required?: (keyof T)[];
  optional?: (keyof T)[];
};

export const combine = <T>(schemas: ObjectSchema<T>[], overrides?: Overrides<T>): ObjectSchema<T> => {
  const properties = schemas.reduce<ObjectSchema<T>['properties']>((accumulator, schema) => ({
    ...accumulator,
    ...schema.properties,
  }), {});

  const required = new Set<keyof T>(schemas.flatMap((schema) => schema.required ?? []));

  overrides?.optional?.forEach((key) => required.delete(key));
  overrides?.required?.forEach((key) => required.add(key));

  const combined: ObjectSchema<T> = {
    type: 'object',
    additionalProperties: false,
    properties,
  };

  if (required.size) {
    combined.required = [...required];
  }

  return combined;
};

export const schemaTesterFactory = <T extends object>(schema: ObjectSchema<T>) => {
  return {
    validateSuccess: (data: T, message: string = '') => {
      it(`valid body ${message}`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });
    },
    type: (data: T, propertyName: string, type: string, message = '') => {
      it(`is not ${type} ${message}`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be ${type}`);
      });
    },
    required: (data: T, propertyName: string, message = '') => {
      it(`is missing ${message}`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`must have required property '${propertyName}'`);
      });
    },
    // dependentRequired: (data: T, propertyName: string, ...dependingPropertyNames: string[]) => {
    //   const plural = dependingPropertyNames.length > 1;
    //   const dependingPropertyName = dependingPropertyNames.join(', ');

    //   it(`is present and ${dependingPropertyName} ${plural ? 'are' : 'is'} missing`, () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`must have propert${plural ? 'ies' : 'y'} ${dependingPropertyName} when property ${propertyName} is present`);
    //   });
    // },
    pattern: (data: T, propertyName: string) => {
      it('does not match pattern', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must match pattern`);
      });
    },
    // format: (data: T, propertyName: string, format: string) => {
    //   it(`is not ${format} format`, () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must match format "${format}"`);
    //   });
    // },
    additionalProperties: (data: T, propertyName: string) => {
      it('has additional property', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have additional properties`);
      });
    },
    // minProperties: (data: T, propertyName: string, minProperties: number) => {
    //   it('has too few properties', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must NOT have fewer than ${minProperties} properties`);
    //   });
    // },
    minLength: (data: T, propertyName: string, minLength: number) => {
      it('is too short', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have fewer than ${minLength} characters`);
      });
    },
    maxLength: (data: T, propertyName: string, maxLength: number) => {
      it('is too long', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have more than ${maxLength} characters`);
      });
    },
    enum: (data: T, propertyName: string) => {
      it('is not a valid enum value', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be equal to one of the allowed values`);
      });
    },
    // const: (data: T, propertyName: string) => {
    //   it('is not the expected constant value', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must be equal to constant`);
    //   });
    // },
    // minimum: (data: T, propertyName: string, minimum: number) => {
    //   it('is too small', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must be >= ${minimum}`);
    //   });
    // },
    // maximum: (data: T, propertyName: string, maximum: number) => {
    //   it('is too large', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must be <= ${maximum}`);
    //   });
    // },
    // exclusiveMinimum: (data: T, propertyName: string, minimum: number) => {
    //   it('is too small', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must be > ${minimum}`);
    //   });
    // },
    // exclusiveMaximum: (data: T, propertyName: string, maximum: number, message = '') => {
    //   it(`is too large ${message}`, () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must be < ${maximum}`);
    //   });
    // },
    // minItems: (data: T, propertyName: string, minItems: number) => {
    //   it('has too few item', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must NOT have fewer than ${minItems} items`);
    //   });
    // },
    // maxItems: (data: T, propertyName: string, maxItems: number) => {
    //   it('has too many item', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} must NOT have more than ${maxItems} items`);
    //   });
    // },
    // formatExclusiveMinimum: (data: T, propertyName: string) => {
    //   it('is earlier than required', () => {
    //     const result = validatorService.validate(data, schema);
    //     expect(result).toContain(`${propertyName} should be >`);
    //   });
    // },
  };
};
