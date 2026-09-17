import { ArraySchema, ObjectSchema, StrictSchema, StringSchema } from '@household/shared/types/schema';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { PathItemObject } from 'openapi3-ts/oas32';
import { entries } from '@household/shared/common/utils';

type Overrides<T> = {
  required?: (keyof T)[];
  optional?: (keyof T)[];
};

export const combine = <T>(schemas: ObjectSchema<T>[], overrides?: Overrides<T>): ObjectSchema<T> => {

  const combined: ObjectSchema<T> = schemas.reduce<ObjectSchema<T>>((accumulator, schema) => {
    return {
      ...accumulator,
      ...schema,
      properties: {
        ...accumulator.properties,
        ...schema.properties,
      },
      dependencies: schema.dependencies ? {
        ...accumulator.dependencies,
        ...schema.dependencies,
      } : accumulator.dependencies,
    };
  }, {
    type: 'object',
    additionalProperties: false,
    properties: {},
  });

  const required = new Set<keyof T>(overrides?.required ?? schemas.flatMap((schema) => schema.required ?? []));

  overrides?.optional?.forEach((key) => required.delete(key));

  if (required.size) {
    combined.required = [...required];
  }

  return combined;
};

const toOpenApiSchema = (schema: StrictSchema<any>): any => {
  if (!schema) {
    return undefined;
  } 

  if (schema.type === 'string') {
    const { formatExclusiveMinimum, formatMinimum, ...rest } = schema;
    return rest;
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    const { exclusiveMinimum, ...rest } = schema;
    if (typeof exclusiveMinimum === 'object') {
      return rest;
    }
    return schema;
  }

  if (schema.type === 'boolean') {
    return schema;
  }

  if (schema.type === 'object') {
    const { anyOf, dependencies, ...rest } = schema;

    return {
      ...rest,
      properties: rest.properties ? entries(rest.properties).reduce((accumulator, [
        key,
        value,
      ]) => {
        return {
          ...accumulator,
          [key]: toOpenApiSchema(value),
        };
      }, {}) : undefined,
      oneOf: rest.oneOf ? rest.oneOf.map((s => toOpenApiSchema(s))) : undefined,
    };
  }

  if (schema.type === 'array') {
    return {
      ...schema,
      items: toOpenApiSchema(schema.items),
    };
  }

  return schema;
};

export const createPath = (params: {
  method: 'post' | 'get' | 'put' | 'delete';
  tags: string[];
  parameters?: {
    name: string;
    in: 'path' | 'query';
    optional?: boolean;
    schema: StringSchema;
  }[];
  requestBodySchema?: ObjectSchema<any> | ArraySchema<any>;
  response: {
    statusCode: number;
    description: string;
    schema?: ObjectSchema<any> | ArraySchema<any>;
  };
}): PathItemObject => {
  const request = toOpenApiSchema(params.requestBodySchema);
  const response = toOpenApiSchema(params.response.schema);

  return {
    [params.method]: {
      tags: params.tags,
      parameters: params.parameters?.map((p) => {
        return {
          name: p.name,
          in: p.in,
          required: !p.optional,
          schema: p.schema,
        };
      }),
      requestBody: request ? {
        content: {
          'application/json': {
            schema: request,
          },
        },
      } : undefined,
      responses: {
        [params.response.statusCode]: {
          description: params.response.description,
          content: response ? {
            'application/json': {
              schema: response,
            },
          } : undefined,
        },
      },
    },
  };
};

export const schemaTesterFactory = <T extends object>(schema: StrictSchema<T>) => {
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
    dependentRequired: (data: T, propertyName: string, ...dependingPropertyNames: string[]) => {
      const plural = dependingPropertyNames.length > 1;
      const dependingPropertyName = dependingPropertyNames.join(', ');

      it(`is present and ${dependingPropertyName} ${plural ? 'are' : 'is'} missing`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`must have propert${plural ? 'ies' : 'y'} ${dependingPropertyName} when property ${propertyName} is present`);
      });
    },
    pattern: (data: T, propertyName: string) => {
      it('does not match pattern', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must match pattern`);
      });
    },
    format: (data: T, propertyName: string, format: string) => {
      it(`is not ${format} format`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must match format "${format}"`);
      });
    },
    additionalProperties: (data: T, propertyName: string) => {
      it('has additional property', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have additional properties`);
      });
    },
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
    minimum: (data: T, propertyName: string, minimum: number) => {
      it('is too small', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be >= ${minimum}`);
      });
    },
    maximum: (data: T, propertyName: string, maximum: number) => {
      it('is too large', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be <= ${maximum}`);
      });
    },
    exclusiveMinimum: (data: T, propertyName: string, minimum: number) => {
      it('is too small', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be > ${minimum}`);
      });
    },
    exclusiveMaximum: (data: T, propertyName: string, maximum: number, message = '') => {
      it(`is too large ${message}`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be < ${maximum}`);
      });
    },
    minItems: (data: T, propertyName: string, minItems: number) => {
      it('has too few item', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have fewer than ${minItems} items`);
      });
    },
    maxItems: (data: T, propertyName: string, maxItems: number) => {
      it('has too many item', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have more than ${maxItems} items`);
      });
    },
    formatExclusiveMinimum: (data: T, propertyName: string) => {
      it('is earlier than required', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} should be >`);
      });
    },
  };
};
