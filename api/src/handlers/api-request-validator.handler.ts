import { JSONSchema7 } from 'json-schema';
import { IValidatorService } from '@household/shared/services/validator-service';
import { badRequestResponse } from '@household/api/common/response-factory';
import { keys } from '@household/shared/common/utils';
import { ObjectSchema } from '@household/shared/types/schema';

type RequestSchemaTypes = { // TODO: remove JSONSchema7 type when all schemas are converted to ObjectSchema
  body?: JSONSchema7 | ObjectSchema<any>;
  pathParameters?: JSONSchema7 | ObjectSchema<any>;
  queryStringParameters?: JSONSchema7 | ObjectSchema<any>;
  multiValueQueryStringParameters?: JSONSchema7 | ObjectSchema<any>;
};

export default (validatorService: IValidatorService) => {
  return (schemas: RequestSchemaTypes): ((event: AWSLambda.APIGatewayProxyEvent) => AWSLambda.APIGatewayProxyEvent) => {
    return (event) => {
      const validationErrors = keys(schemas).reduce((accumulator, currentValue) => {
        const data = currentValue === 'body' ? JSON.parse(event[currentValue]) : event[currentValue];
        const validation = validatorService.validate(data, schemas[currentValue]);
        if (validation) {
          return {
            ...accumulator,
            [currentValue]: validation,
          };
        }
        return accumulator;
      }, {});

      if (Object.values(validationErrors).length > 0) {
        throw badRequestResponse(validationErrors);
      }

      return event;
    };
  };
};
