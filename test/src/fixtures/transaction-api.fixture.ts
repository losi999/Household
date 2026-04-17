import { getTransactionId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Account, Common, File, Report, Transaction } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { expect as deferredTransactionApiExpect } from '@household/test/fixtures/deferred-transaction-api.fixture';
import { expect as paymentTransactionApiExpect } from '@household/test/fixtures/payment-transaction-api.fixture';
import { expect as reimbursementTransactionApiExpect } from '@household/test/fixtures/reimbursement-transaction-api.fixture';
import { expect as splitTransactionApiExpect } from '@household/test/fixtures/split-transaction-api.fixture';
// import { expect as transferTransactionApiExpect } from '@household/test/fixtures/transfer-transaction-api.fixture';
// import { expect as draftTransactionApiExpect } from '@household/test/fixtures/draft-transaction-api.fixture';
import { APIResponse, mergeExpects } from '@playwright/test';

type TransactionApiFixture = {
  requestCreatePaymentTransaction(transaction: Transaction.PaymentRequest): Promise<APIResponse>;
  requestUpdateToPaymentTransaction(transactionId: Transaction.Id, transaction: Transaction.PaymentRequest): Promise<APIResponse>;
  requestCreateSplitTransaction(transaction: Transaction.SplitRequest): Promise<APIResponse>;
  requestUpdateToSplitTransaction(transactionId: Transaction.Id, transaction: Transaction.SplitRequest): Promise<APIResponse>;
  requestCreateTransferTransaction(transaction: Transaction.TransferRequest): Promise<APIResponse>;
  requestUpdateToTransferTransaction(transactionId: Transaction.Id, transaction: Transaction.TransferRequest): Promise<APIResponse>;
  requestDeleteTransaction(transactionId: Transaction.Id): Promise<APIResponse>;
  requestGetTransaction(accountId: Account.Id, transactionId: Transaction.Id): Promise<APIResponse>;
  requestGetTransactionListByAccount(accountId: Account.Id, querystring?: Partial<Common.Pagination<number>>): Promise<APIResponse>;
  requestGetTransactionReports(report: Report.Request): Promise<APIResponse>;
  requestGetTransactionListByFile(fileId: File.Id): Promise<APIResponse>;
};

export const test = baseTest.extend<TransactionApiFixture>({
  requestCreatePaymentTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transaction: Transaction.PaymentRequest) => {
      return request.post(`${process.env.BASE_URL}/transaction/v1/transactions/payment`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestUpdateToPaymentTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Transaction.Id, transaction: Transaction.PaymentRequest) => {
      return request.put(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}/payment`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestCreateSplitTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transaction: Transaction.SplitRequest) => {
      return request.post(`${process.env.BASE_URL}/transaction/v1/transactions/split`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestUpdateToSplitTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Transaction.Id, transaction: Transaction.SplitRequest) => {
      return request.put(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}/split`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestCreateTransferTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transaction: Transaction.TransferRequest) => {
      return request.post(`${process.env.BASE_URL}/transaction/v1/transactions/transfer`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestUpdateToTransferTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Transaction.Id, transaction: Transaction.TransferRequest) => {
      return request.put(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}/transfer`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN, 
        },
        data: transaction,
      });
    };
    await use(fn);
  },
  requestDeleteTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (transactionId: Transaction.Id) => {
      return request.delete(`${process.env.BASE_URL}/transaction/v1/transactions/${transactionId}`, {
        headers: {
          Authorization: authToken, 
        },
      });
    };
    await use(fn);
  },
  requestGetTransaction: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (accountId: Account.Id, transactionId: Transaction.Id) => {
      return request.get(`${process.env.BASE_URL}/transaction/v1/accounts/${accountId}/transactions/${transactionId}`, {
        headers: {
          Authorization: authToken, 
        },
      });
    };
    await use(fn);
  },
  requestGetTransactionListByAccount: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (accountId: Account.Id, querystring?: Partial<Common.Pagination<number>>) => {
      return request.get(`${process.env.BASE_URL}/transaction/v1/accounts/${accountId}/transactions`, {
        headers: {
          Authorization: authToken, 
        },
        params: querystring as Record<string, string | number | boolean>,
      });
    };
    await use(fn);
  },
  requestGetTransactionReports: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (report: Report.Request) => {
      return request.post(`${process.env.BASE_URL}/transaction/v1/transactionReports`, {
        headers: {
          Authorization: authToken, 
        },
        data: report,
      });
    };
    await use(fn);
  },
  requestGetTransactionListByFile: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    const fn = async (fileId: File.Id) => {
      return request.get(`${process.env.BASE_URL}/transaction/v1/files/${fileId}/transactions`, {
        headers: {
          Authorization: authToken, 
        },
      });
    };
    await use(fn);
  },
});

const transactionApiExpect = baseExpect.extend({
  toHaveBeenDeletedFromDatabase(document: Transaction.Document) {
    return {
      pass: !document,
      message: () => `expected transaction to be deleted from database, but it was found with id ${getTransactionId(document)}`,
    };
  },
});

export const expect = mergeExpects(transactionApiExpect, deferredTransactionApiExpect, paymentTransactionApiExpect, reimbursementTransactionApiExpect, splitTransactionApiExpect /*, transferTransactionApiExpect, draftTransactionApiExpect */);
