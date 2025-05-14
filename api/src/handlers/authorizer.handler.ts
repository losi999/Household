import { forbiddenResponse } from '@household/api/common/response-factory';
import { UserType } from '@household/shared/enums';

export default () => (...allowedUserTypes: UserType[]): (event: AWSLambda.APIGatewayProxyEvent) => AWSLambda.APIGatewayProxyEvent => {
  return (event) => {
    console.log(allowedUserTypes);
    const userGroups = event.requestContext.authorizer.claims['cognito:groups'].split(',') as UserType[];

    if (!allowedUserTypes.some(u => userGroups.includes(u))) {
      throw forbiddenResponse();
    }

    return event;
  };
};
