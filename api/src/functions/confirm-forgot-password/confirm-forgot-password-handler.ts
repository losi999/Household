import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IConfirmForgotPasswordService } from '@household/api/functions/confirm-forgot-password/confirm-forgot-password-service';

export default (confirmForgotPassword: IConfirmForgotPasswordService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { email } = event.pathParameters;
    const body = JSON.parse(event.body);

    try {
      await confirmForgotPassword({
        email,
        body,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse();
  };
};
