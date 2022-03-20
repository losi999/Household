import { UserType } from '@household/shared/types/common';

export default () =>
  (...userTypes: UserType[]) =>
    (handler: AWSLambda.APIGatewayProxyHandler): AWSLambda.APIGatewayProxyHandler =>
      async (event, context, callback) => {
        const groups = event.requestContext.authorizer.claims['cognito:groups'].split(',');

        if (!userTypes.some(u => groups.includes(u))) {
          return {
            statusCode: 403,
            body: '',
          };
        }
        return handler(event, context, callback) as Promise<AWSLambda.APIGatewayProxyResult>;
      };
