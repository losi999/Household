import { ObjectSchema } from '@household/shared/types/schema';
import { default as Ajv, ErrorObject } from 'ajv';
import { JSONSchema7 } from 'json-schema';

export interface IValidatorService {
  validate(obj: object, schema: JSONSchema7 | ObjectSchema<any>): string | undefined; // TODO: remove JSONSchema7 type when all schemas are converted to ObjectSchema
}

export const validatorServiceFactory = (validator: Ajv): IValidatorService => {
  const customErrorsText = (error: ErrorObject) => {
    const defaultMessage = `data${error.instancePath} ${error.message}`;
    if (error.keyword === 'additionalProperties') {
      return `data${error.instancePath} must NOT have additional properties ${error.params?.additionalProperty}`;
    }

    return defaultMessage;
  };

  return {
    validate: (obj, schema) => {
      const isValid = validator.validate(schema, obj);
      if (!isValid) {
        return validator.errors.map(e => customErrorsText(e)).join((','));
      }
    },
  };
};
