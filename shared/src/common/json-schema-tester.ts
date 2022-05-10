import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { JSONSchema7 } from 'json-schema';

export const jsonSchemaTesterFactory = <T extends object>(schema: JSONSchema7) => {
  return {
    validateSuccess: (data: T) => {
      const result = validatorService.validate(data, schema);
      expect(result).toBeUndefined();
    },
    validateSchemaType: (data: T, propertyName: string, type: string) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must be ${type}`);
    },
    validateSchemaRequired: (data: T, propertyName: string) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`must have required property '${propertyName}'`);
    },
    validateSchemaPattern: (data: T, propertyName: string) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must match pattern`);
    },
    validateSchemaFormat: (data: T, propertyName: string, format: string) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must match format "${format}"`);
    },
    validateSchemaAdditionalProperties: (data: T, propertyName: string) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`${propertyName} must NOT have additional properties`);
    },
    validateSchemaMinLength: (data: T, propertyName: string, minLength: number) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must NOT have fewer than ${minLength} characters`);
    },
    validateSchemaMaxLength: (data: T, propertyName: string, maxLength: number) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must NOT be longer than ${maxLength} characters`);
    },
    validateSchemaEnumValue: (data: T, propertyName: string) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must be equal to one of the allowed values`);
    },
    validateSchemaMinimum: (data: T, propertyName: string, minimum: number) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must be >= ${minimum}`);
    },
    validateSchemaExclusiveMinimum: (data: T, propertyName: string, minimum: number) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must be > ${minimum}`);
    },
    validateSchemaMinItems: (data: T, propertyName: string, minItems: number) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} must NOT have fewer than ${minItems} items`);
    },
    validateSchemaFormatExclusiveMinimum: (data: T, propertyName: string) => {
      const result = validatorService.validate(data, schema);
      expect(result).toContain(`data/${propertyName} should be >`);
    },
  };
};
