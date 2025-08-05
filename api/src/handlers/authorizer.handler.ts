import { forbiddenResponse } from '@household/api/common/response-factory';
import { UserType } from '@household/shared/enums';

export default () => (...allowedUserTypes: UserType[]): (event: AWSLambda.APIGatewayProxyEvent) => AWSLambda.APIGatewayProxyEvent => {
  return (event) => {
    const userGroups = event.requestContext.authorizer.claims['cognito:groups']?.split(',') as UserType[] ?? [];

    if (!allowedUserTypes.some(u => userGroups.includes(u))) {
      throw forbiddenResponse();
    }

    return event;
  };
};
