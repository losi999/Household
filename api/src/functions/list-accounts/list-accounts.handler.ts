
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListAccountsService } from '@household/api/functions/list-accounts/list-accounts.service';
import { Responses } from '@household/shared/types/responses';

export default (listAccounts: IListAccountsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let accounts: Responses.Account[];
    try {
      accounts = await listAccounts();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(accounts);
  };
};
