import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetAccountService } from '@household/api/functions/get-account/get-account.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Responses } from '@household/shared/types/responses';

export default (getAccount: IGetAccountService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { accountId } = castPathParameters(event);

    let account: Responses.Account;
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
