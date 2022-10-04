import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetAccountService } from '@household/api/functions/get-account/get-account.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Account } from '@household/shared/types/types';

export default (getAccount: IGetAccountService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { accountId } = castPathParameters(event);

    let account: Account.Response;
    try {
      account = await getAccount({
        accountId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(account);
  };
};
