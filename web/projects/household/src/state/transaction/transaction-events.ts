import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const transactionEvents = eventGroup({
  source: 'Transaction',
  events: {
    deleteTransaction: type<Responses.Transaction>(),
  },
});

export const transactionApiEvents = eventGroup({
  source: 'Transaction API',
  events: {
    listTransactionsByAccountInitiated: type<Api.Account.AccountId & Api.Pagination<number>>(),
    listTransactionsByAccountCompleted: type<Pick<Api.Pagination<number>, 'pageNumber'> & { transactions: Responses.Transaction[] }>(),
    deleteTransactionInitiated: type<Api.Transaction.TransactionId>(),
    deleteTransactionCompleted: type<Api.Transaction.TransactionId>(),
    deleteTransactionFailed: type<Api.Transaction.TransactionId>(),
  },
});
