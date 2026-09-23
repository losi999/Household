import { getTransactionId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Api } from '@household/shared/types/api';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { expect as deferredTransactionApiExpect } from '@household/test/fixtures/deferred-transaction-api.fixture';
import { expect as paymentTransactionApiExpect } from '@household/test/fixtures/payment-transaction-api.fixture';
import { expect as reimbursementTransactionApiExpect } from '@household/test/fixtures/reimbursement-transaction-api.fixture';
import { expect as splitTransactionApiExpect } from '@household/test/fixtures/split-transaction-api.fixture';
import { expect as transferTransactionApiExpect } from '@household/test/fixtures/transfer-transaction-api.fixture';
import { expect as draftTransactionApiExpect } from '@household/test/fixtures/draft-transaction-api.fixture';
import { APIResponse, mergeExpects } from '@playwright/test';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

type TransactionApiFixture = {
  requestCreatePaymentTransaction(transaction: Requests.PaymentTransaction): Promise<APIResponse>;
  requestUpdateToPaymentTransaction(transactionId: Api.Transaction.Id, transaction: Requests.PaymentTransaction): Promise<APIResponse>;
  requestCreateSplitTransaction(transaction: Requests.SplitTransaction): Promise<APIResponse>;
  requestUpdateToSplitTransaction(transactionId: Api.Transaction.Id, transaction: Requests.SplitTransaction): Promise<APIResponse>;
  requestCreateTransferTransaction(transaction: Requests.TransferTransaction): Promise<APIResponse>;
  requestUpdateToTransferTransaction(transactionId: Api.Transaction.Id, transaction: Requests.TransferTransaction): Promise<APIResponse>;
  requestDeleteTransaction(transactionId: Api.Transaction.Id): Promise<APIResponse>;
  requestGetTransaction(accountId: Api.Account.Id, transactionId: Api.Transaction.Id): Promise<APIResponse>;
  requestGetTransactionListByAccount(accountId: Api.Account.Id, querystring?: Partial<Api.Pagination<number>>): Promise<APIResponse>;
  requestGetTransactionReports(report: Requests.Report): Promise<APIResponse>;
  requestGetTransactionListByFile(fileId: Api.File.Id): Promise<APIResponse>;
};

export const test = baseTest.extend<TransactionApiFixture>({
  requestCreatePaymentTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transaction: Requests.PaymentTransaction) => {
      return loggedRequest.post(`${process.env.BASE_URL}/transaction/v1/transactions/payment`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestUpdateToPaymentTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Api.Transaction.Id, transaction: Requests.PaymentTransaction) => {
      return loggedRequest.put(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}/payment`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestCreateSplitTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transaction: Requests.SplitTransaction) => {
      return loggedRequest.post(`${process.env.BASE_URL}/transaction/v1/transactions/split`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestUpdateToSplitTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Api.Transaction.Id, transaction: Requests.SplitTransaction) => {
      return loggedRequest.put(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}/split`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestCreateTransferTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transaction: Requests.TransferTransaction) => {
      return loggedRequest.post(`${process.env.BASE_URL}/transaction/v1/transactions/transfer`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestUpdateToTransferTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Api.Transaction.Id, transaction: Requests.TransferTransaction) => {
      return loggedRequest.put(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}/transfer`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestDeleteTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Api.Transaction.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}`, {
        headers: {
          Authorization: authToken, 
        },
      });
    };
    await use(fn);
  },
  requestGetTransaction: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (accountId: Api.Account.Id, transactionId: Api.Transaction.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/transaction/v1/accounts/${accountId}/transactions/${transactionId}`, {
        headers: {
          Authorization: authToken, 
        },
      });
    };
    await use(fn);
  },
  requestGetTransactionListByAccount: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (accountId: Api.Account.Id, querystring?: Partial<Api.Pagination<number>>) => {
      return loggedRequest.get(`${process.env.BASE_URL}/transaction/v1/accounts/${accountId}/transactions`, {
        headers: {
          Authorization: authToken, 
        },
        params: querystring as Record<string, string | number | boolean>,
      });
    };
    await use(fn);
  },
  requestGetTransactionReports: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (report: Requests.Report) => {
      return loggedRequest.post(`${process.env.BASE_URL}/transaction/v1/transactionReports`, {
        headers: {
          Authorization: authToken, 
        },
        data: report,
      });
    };
    await use(fn);
  },
  requestGetTransactionListByFile: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (fileId: Api.File.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/transaction/v1/files/${fileId}/transactions`, {
        headers: {
          Authorization: authToken, 
        },
      });
    };
    await use(fn);
  },
});

const transactionApiExpect = baseExpect.extend({
  toHaveBeenDeletedFromDatabase(document: Documents.Transaction) {
    return {
      pass: !document,
      message: () => `expected transaction to be deleted from database, but it was found with id ${getTransactionId(document)}`,
    };
  },
});

export const expect = mergeExpects(transactionApiExpect, deferredTransactionApiExpect, paymentTransactionApiExpect, reimbursementTransactionApiExpect, splitTransactionApiExpect, transferTransactionApiExpect, draftTransactionApiExpect);
