
import { createdResponse, errorResponse } from '@household/api/common/response-factory';
import { ICreateUserService } from '@household/api/functions/create-user/create-user.service';

export default (createUser: ICreateUserService): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const body = JSON.parse(event.body);
    try {
      await createUser({
        body,
      });

    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse();
  };
