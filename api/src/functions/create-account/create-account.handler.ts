import { createdResponse, errorResponse } from '@household/api/common/response-factory';
import { ICreateAccountService } from '@household/api/functions/create-account/create-account.service';
import { headerExpiresIn } from '@household/shared/constants';

export default (createAccount: ICreateAccountService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let accountId: string;
    try {
      accountId = await createAccount({
        body,
        expiresIn: Number(event.headers[headerExpiresIn]),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      accountId,
    });
  };
};
