import { IRefreshTokenService } from '@household/api/functions/refresh-token/refresh-token.service';
import { Auth } from '@household/shared/types/types';

export default (refreshToken: IRefreshTokenService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    let loginResponse: Auth.RefreshToken.Response;
    try {
      loginResponse = await refreshToken({
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
