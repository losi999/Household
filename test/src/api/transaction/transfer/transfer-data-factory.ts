import { getAccountId, toDictionary } from '@household/shared/common/utils';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Account, Transaction } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';
import { transferTransactionDocumentConverter } from '@household/shared/dependencies/converters/transfer-transaction-document-converter';

export const transferTransactionDataFactory = (() => {
  const createTransferTransactionRequest: DataFactoryFunction<Transaction.TransferRequest> = (req) => {
    const amount = req?.amount ?? faker.number.float({
      min: -10000,
      max: 0,
    });

    return {
      amount,
      transferAmount: faker.number.float({
        max: 10000,
        min: 0,
      }),
      description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      issuedAt: faker.date.recent().toISOString(),
      accountId: undefined,
      transferAccountId: undefined,
      payments: undefined,
      ...req,
    };
  };

  const createTransferTransactionDocument = (ctx: {
    body?: Partial<Transaction.TransferRequest>;
    account: Account.Document;
    transferAccount: Account.Document;
    transactions?: Transaction.DeferredDocument[];
  }): Transaction.TransferDocument => {
    return transferTransactionDocumentConverter.create({
      body: createTransferTransactionRequest({
        ...ctx.body,
        accountId: getAccountId(ctx.account),
        transferAccountId: getAccountId(ctx.transferAccount),
        payments: ctx.transactions ? ctx.transactions.map(t => ({
          transactionId: t._id,
          amount: faker.number.float({
            min: 1,
            max: 500,
          }),
        })) : undefined,
      }),
      account: ctx.account,
      transferAccount: ctx.transferAccount,
      transactions: ctx.transactions ? toDictionary(ctx.transactions, '_id') : undefined,
    }, Cypress.env('EXPIRES_IN'), true);
  };

  return {
    request: createTransferTransactionRequest,
    document: createTransferTransactionDocument,
    id: (createId<Transaction.Id>),
  };
})();
