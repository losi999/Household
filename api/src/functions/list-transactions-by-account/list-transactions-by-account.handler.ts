import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListTransactionsByAccountService } from '@household/api/functions/list-transactions-by-account/list-transactions-by-account.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export default (listTransactionsByAccount: IListTransactionsByAccountService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { accountId } = castPathParameters(event);
    const { pageSize, pageNumber } = (event.queryStringParameters ?? {}) as Api.Pagination<string>;

    let transactions: Responses.Transaction[];
    try {
      transactions = await listTransactionsByAccount({
        accountId,
        pageNumber: pageNumber ? Number(pageNumber) : 1,
        pageSize: pageSize ? Number(pageSize) : 25,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
