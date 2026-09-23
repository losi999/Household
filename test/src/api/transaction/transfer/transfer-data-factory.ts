import { getAccountId } from '@household/shared/common/utils';
import { Documents } from '@household/shared/types/documents';
import { transferTransactionDocumentConverter } from '@household/shared/dependencies/converters/transfer-transaction-document-converter';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const transferTransactionDataFactory = (() => {
  const createTransferTransactionDocument = (ctx: {
    body?: Partial<Requests.TransferTransaction>;
    account: Documents.Account;
    transferAccount: Documents.Account;
  }): Documents.TransferTransaction => {
    return transferTransactionDocumentConverter.create({
      body: testDataFactory.transaction.request.transfer({
        ...ctx.body,
        accountId: getAccountId(ctx.account),
        transferAccountId: getAccountId(ctx.transferAccount),
      }),
      account: ctx.account,
      transferAccount: ctx.transferAccount,
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    request: testDataFactory.transaction.request.transfer,
    document: createTransferTransactionDocument,
    id: testDataFactory.transaction.id,
  };
})();
