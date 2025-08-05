import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { JSONSchema7 } from 'json-schema';

export const jsonSchemaTesterFactory = <T extends object>(schema: JSONSchema7) => {
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
    minProperties: (data: T, propertyName: string, minProperties: number) => {
      it('has too few properties', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have fewer than ${minProperties} properties`);
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
    formatExclusiveMinimum: (data: T, propertyName: string) => {
      it('is earlier than required', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} should be >`);
      });
    },
  };
};
