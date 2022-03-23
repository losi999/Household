import { default as apiRequestValidatorHandler } from '@household/api/handlers/api-request-validator.handler';
import { validatorService } from '@household/shared/dependencies/services/validator-service';

export const apiRequestValidator = apiRequestValidatorHandler(validatorService);
