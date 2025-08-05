import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IForgotPasswordService } from '@household/api/functions/forgot-password/forgot-password-service';

export default (forgotPassword: IForgotPasswordService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    try {
      await forgotPassword({
        body,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse();
  };
};
