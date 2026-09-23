import { okResponse } from '@household/api/common/response-factory';
import { IRefreshTokenService } from '@household/api/functions/refresh-token/refresh-token.service';
import { Responses } from '@household/shared/types/responses';

export default (refreshToken: IRefreshTokenService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    let loginResponse: Responses.RefreshToken;
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

    return okResponse(loginResponse);
  };
};
