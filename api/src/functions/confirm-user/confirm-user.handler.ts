
import { createdResponse, errorResponse } from '@household/api/common/response-factory';
import { IConfirmUserService } from '@household/api/functions/confirm-user/confirm-user.service';

export default (confirmUserService: IConfirmUserService): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const { email } = event.pathParameters;
    const body = JSON.parse(event.body);
    try {
      await confirmUserService({
        body,
        email,
      });

    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse();
  };
