import { createdResponse, errorResponse } from '@household/api/common/response-factory';
import { IUpdateAccountService } from '@household/api/functions/update-account/update-account.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateAccount: IUpdateAccountService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { accountId } = castPathParameters(event);

    try {
      await updateAccount({
        accountId,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
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
