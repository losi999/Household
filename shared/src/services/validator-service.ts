import { Ajv } from 'ajv';
import { JSONSchema7 } from 'json-schema';

export interface IValidatorService {
  validate(obj: object, schema: JSONSchema7): string | undefined;
}

export const validatorServiceFactory = (validator: Ajv): IValidatorService => {
  return {
    validate: (obj: object, schema: JSONSchema7) => {
      const isValid = validator.validate(schema, obj);
      if (!isValid) {
        return validator.errorsText();
      }
    },
  };
};
