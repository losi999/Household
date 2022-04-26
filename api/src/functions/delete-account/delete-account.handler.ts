import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteAccountService } from '@household/api/functions/delete-account/delete-account.service';
import { castPathParameters } from '@household/shared/common/utils';

export default (deleteAccount: IDeleteAccountService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { accountId } = castPathParameters(event);

    try {
      await deleteAccount({
        accountId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
