import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListTransactionsByFileService } from '@household/api/functions/list-transactions-by-file/list-transactions-by-file.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Transaction } from '@household/shared/types/types';

export default (listTransactionsByFile: IListTransactionsByFileService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { fileId } = castPathParameters(event);

    let transactions: Transaction.Response[];
    try {
      transactions = await listTransactionsByFile({
        fileId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(transactions);
  };
};
