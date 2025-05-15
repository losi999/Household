import { JSONSchema7 } from 'json-schema';
import { IValidatorService } from '@household/shared/services/validator-service';
import { badRequestResponse } from '@household/api/common/response-factory';
import { keys } from '@household/shared/common/utils';

type RequestSchemaTypes = {
  body?: JSONSchema7;
  pathParameters?: JSONSchema7;
  queryStringParameters?: JSONSchema7;
  multiValueQueryStringParameters?: JSONSchema7;
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
