import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { ILoginService } from '@household/api/functions/login/login.service';
import { Auth } from '@household/shared/types/types';

export default (login: ILoginService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    let loginResponse: Auth.Login.Response;
    try {
      loginResponse = await login({
        body,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(loginResponse);
  };
};
