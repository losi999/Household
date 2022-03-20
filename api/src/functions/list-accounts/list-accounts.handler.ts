
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListAccountsService } from '@household/api/functions/list-accounts/list-accounts.service';
import { Account } from '@household/shared/types/types';

export default (listAccounts: IListAccountsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let accounts: Account.Response[];
    try {
      accounts = await listAccounts();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(accounts);
  };
};
