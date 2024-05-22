import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { JSONSchema7 } from 'json-schema';

export const jsonSchemaTesterFactory = <T extends object>(schema: JSONSchema7) => {
  return {
    validateSuccess: (data: T) => {
      it('should accept valid body', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });
    },
    validateSchemaType: (data: T, propertyName: string, type: string) => {
      it(`is not ${type}`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be ${type}`);
      });
    },
    validateSchemaRequired: (data: T, propertyName: string) => {
      it('is missing', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`must have required property '${propertyName}'`);
      });
    },
    validateSchemaDependentRequired: (data: T, propertyName: string, ...dependingPropertyNames: string[]) => {
      const plural = dependingPropertyNames.length > 1;
      const dependingPropertyName = dependingPropertyNames.join(', ');

      it(`is present and ${dependingPropertyName} ${plural ? 'are' : 'is'} missing`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`must have propert${plural ? 'ies' : 'y'} ${dependingPropertyName} when property ${propertyName} is present`);
      });
    },
    validateSchemaPattern: (data: T, propertyName: string) => {
      it('does not match pattern', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must match pattern`);
      });
    },
    validateSchemaFormat: (data: T, propertyName: string, format: string) => {
      it(`is not ${format} format`, () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must match format "${format}"`);
      });
    },
    validateSchemaAdditionalProperties: (data: T, propertyName: string) => {
      it('has additional property', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have additional properties`);
      });
    },
    validateSchemaMinProperties: (data: T, propertyName: string, minProperties: number) => {
      it('has too few properties', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have fewer than ${minProperties} properties`);
      });
    },
    validateSchemaMinLength: (data: T, propertyName: string, minLength: number) => {
      it('is too short', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have fewer than ${minLength} characters`);
      });
    },
    validateSchemaMaxLength: (data: T, propertyName: string, maxLength: number) => {
      it('is too long', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT be longer than ${maxLength} characters`);
      });
    },
    validateSchemaEnumValue: (data: T, propertyName: string) => {
      it('is not a valid enum value', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be equal to one of the allowed values`);
      });
    },
    validateSchemaMinimum: (data: T, propertyName: string, minimum: number) => {
      it('is too small', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be >= ${minimum}`);
      });
    },
    validateSchemaExclusiveMinimum: (data: T, propertyName: string, minimum: number) => {
      it('is too small', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must be > ${minimum}`);
      });
    },
    validateSchemaMinItems: (data: T, propertyName: string, minItems: number) => {
      it('has too few item', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} must NOT have fewer than ${minItems} items`);
      });
    },
    validateSchemaFormatExclusiveMinimum: (data: T, propertyName: string) => {
      it('is earlier than required', () => {
        const result = validatorService.validate(data, schema);
        expect(result).toContain(`${propertyName} should be >`);
      });
    },
  };
};
