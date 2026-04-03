import ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import { validatorServiceFactory } from '@household/shared/services/validator-service';

const ajvValidator = ajvFormats(new ajv({
  $data: true,
  allErrors: true,
}));

export const validatorService = validatorServiceFactory(ajvValidator);
