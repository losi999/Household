import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { ILoginService } from '@household/api/functions/login/login.service';
import { Responses } from '@household/shared/types/responses';

export default (login: ILoginService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    let loginResponse: Responses.Login;
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
