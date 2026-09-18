import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { Documents } from '@household/shared/types/documents';
import { deferredTransactionDocumentConverter } from '@household/shared/dependencies/converters/deferred-transaction-document-converter';
import { AccountType } from '@household/shared/enums';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Requests } from '@household/shared/types/requests';

export const deferredTransactionDataFactory = (() => {
  const createDeferredTransactionDocument = (ctx: {
    body?: Partial<Requests.PaymentTransaction>;
    account: Documents.Account;
    loanAccount: Documents.Account;
    category?: Documents.Category;
    product?: Documents.Product;
    project?: Documents.Project;
    recipient?: Documents.Recipient;
  }): Documents.DeferredTransaction => {
    if (ctx.account.accountType === AccountType.Loan) {
      throw 'Paying account type cannot be loan in deferred transaction';
    }

    return deferredTransactionDocumentConverter.create({
      body: testDataFactory.transaction.request.payment({
        ...ctx.body,
        accountId: getAccountId(ctx.account),
        loanAccountId: getAccountId(ctx.loanAccount),
        categoryId: getCategoryId(ctx.category),
        productId: getProductId(ctx.product),
        projectId: getProjectId(ctx.project),
        recipientId: getRecipientId(ctx.recipient),
      }),
      payingAccount: ctx.account,
      ownerAccount: ctx.loanAccount,
      category: ctx.category,
      product: ctx.product,
      project: ctx.project,
      recipient: ctx.recipient,
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    id: testDataFactory.transaction.id,
    request: testDataFactory.transaction.request.payment,
    document: createDeferredTransactionDocument,
  };
})();
