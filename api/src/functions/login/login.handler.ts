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
      return {
        statusCode: error.statusCode,
        body: error.message,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(loginResponse),
    };
  };
};
