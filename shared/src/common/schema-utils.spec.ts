import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema } from '@household/shared/types/schema';

describe('combine', () => {
  type Name = {
    name: string;
  };

  type Age = {
    age: number;
  };

  const Name: ObjectSchema<Name> = {
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
      name: {
        type: 'string',
      },
    },
  };

  const Age: ObjectSchema<Age> = {
    type: 'object',
    additionalProperties: false,
    required: ['age'],
    properties: {
      age: {
        type: 'number',
      },
    },
  };

  it('should merge properties from every input schema', () => {
    const result = combine<Name & Age>([
      Name,
      Age,
    ]);

    expect(result.properties).toEqual({
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
    });
  });

  it('should union required from every input schema by default', () => {
    const result = combine<Name & Age>([
      Name,
      Age,
    ]);

    expect(result.required).toEqual([
      'name',
      'age',
    ]);
  });

  it('should remove a key from required via overrides.optional', () => {
    const result = combine<Name & Age>([
      Name,
      Age,
    ], {
      optional: ['age'],
    });

    expect(result.required).toEqual(['name']);
  });

  it('should add a key to required via overrides.required', () => {
    const Base: ObjectSchema<Partial<Name>> = {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
        },
      },
    };

    const result = combine<Name>([Base], {
      required: ['name'],
    });

    expect(result.required).toEqual(['name']);
  });

  it('should default additionalProperties to false and type to object', () => {
    const result = combine<Name>([Name]);

    expect(result.type).toBe('object');
    expect(result.additionalProperties).toBe(false);
  });
});
