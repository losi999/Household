import ajv from 'ajv';
import { validatorServiceFactory } from '@household/shared/services/validator-service';

const ajvValidator = new ajv({
  allErrors: true,
  format: 'full',
});

export const validatorService = validatorServiceFactory(ajvValidator);
